// @ts-ignore
const express = require("express")
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const solc = require('solc');
const cors = require("cors")
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const EmployeeModel = require('./models/Employee')
const { execSync } = require('child_process');

require('dotenv').config();

const app = express()
app.use(express.json())
app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect("mongodb://localhost:27017/")
mongoose.connect(process.env.MONGODB_URL);


app.post('/compile', (req, res) => {
  try {
      const { fileName, fileContent } = req.body;

      // Extract Solidity version from file content
      const versionMatch = fileContent.match(/pragma solidity (\^?\d+(\.\d+)+);/);
      const solidityVersion = versionMatch ? versionMatch[1] : '0.8.0'; // Use default version if not specified

      // Use the extracted Solidity version to install the corresponding solc compiler
      execSync(`npm install solc@${solidityVersion}`, { stdio: 'ignore' });

      const solc = require(`solc@${solidityVersion}`);

      const input = {
          language: 'Solidity',
          sources: {
              [fileName]: {
                  content: fileContent,
              },
          },
          settings: {
              outputSelection: {
                  '*': {
                      '*': ['*'],
                  },
              },
          },
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors) {
          res.status(400).json({ error: 'Compilation error', errors: output.errors });
      } else {
          const contractName = Object.keys(output.contracts[fileName])[0];
          const bytecode = output.contracts[fileName][contractName].evm.bytecode.object;
          res.json({ bytecode });
      }
  } catch (error) {
      console.error('Error during compilation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/generate-image', async (req, res) => {
    try {
        const { bytecode } = req.body;

        // Save the bytecode to a temporary file
        const tempFilePath = path.join(__dirname, 'temp.sol');
        fs.writeFileSync(tempFilePath, bytecode, 'utf-8');

        // Use the Python script to generate the image
        const pythonProcess = spawn('python', ['generate_image.py', tempFilePath]);

        let imageData = Buffer.from([]);

        pythonProcess.stdout.on('data', (data) => {
            imageData = Buffer.concat([imageData, data]);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error during image generation: ${data}`);
            res.status(500).json({ error: 'Internal Server Error' });
        });

        pythonProcess.on('close', (code) => {
            // Clean up the temporary file
            fs.unlinkSync(tempFilePath);

            if (code === 0) {
                // Send the binary image data as a Buffer
                res.setHeader('Content-Type', 'image/png');
                res.send(imageData);
            } else {
                console.error(`Image generation process exited with code ${code}`);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error during image generation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  

app.post("/login", (req, res) => {
    const {email, password} = req.body;
    EmployeeModel.findOne({email: email})
    .then(user => {
        if(user){
            if(user.password === password){
                res.json("Success")
            }
            else{
                res.json("the password is incorrect")
            }
        }
        else{
            res.json("User doesn't exist")
        }
    })
})

app.post('/register', (req,res) =>{
    EmployeeModel.create(req.body)
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
})

app.listen(3001,() => {
    console.log("server is running")
})