// @ts-ignore
const express = require("express")
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const solc = require('solc');
const cors = require("cors")
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const UserModel = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hre = require("hardhat");

require('dotenv').config();

const app = express()
app.use(express.json())
app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect("mongodb://localhost:27017/")
mongoose.connect(process.env.MONGODB_URL);


app.post('/compile', async (req, res) => {
    try {
        const fileName = req.body.fileName;
        const fileContent = req.body.fileContent;
  
        // Write the contract to a Solidity file
        require('fs').writeFileSync(`./contracts/${fileName}`, fileContent);
  
        // Compile the contract using Hardhat
        await hre.run('compile');
  
        // Extract the contract name from the file content
        const contractName = fileContent.match(/contract\s+(\w+)\s*{/)[1];
  
        // Load the compiled contract
        const contractArtifact = require(`./artifacts/contracts/${fileName}/${contractName}.json`);
  
        // Extract the bytecode
        const bytecode = contractArtifact.bytecode;

  
        res.json({ bytecode: bytecode });
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

app.post('/detect-vulnerabilities', async (req, res) => {
  try {
    const { rgbImage } = req.body;

    // Decode base64 encoded image data
    const imageData = Buffer.from(rgbImage, 'base64');

    // Save the image data to a temporary file
    const tempImagePath = path.join(__dirname, 'temp.png');
    fs.writeFileSync(tempImagePath, imageData);

    // Use the Python script to run vulnerability detection
    const pythonProcess = spawn('python', ['predict.py', tempImagePath]);

    let predictions = '';

    pythonProcess.stdout.on('data', (data) => {
      predictions += data;
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error during vulnerability detection: ${data}`);
      // Don't send a response here to avoid headers being sent multiple times
    });

    pythonProcess.on('close', (code) => {
      // Clean up the temporary file
      fs.unlinkSync(tempImagePath);

      const parsedPredictions = JSON.parse(predictions);
      res.json(parsedPredictions);
    });
  } catch (error) {
    console.error('Error during vulnerability detection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/save-file', (req, res) => {
//   try {
//       const { fileName, fileContent } = req.body;

//       // Specify the directory where you want to save the files
//       const saveDirectory = 'C:\\Users\\ponnu\\Downloads';

//       // Construct the full path for saving the file
//       const filePath = path.join(saveDirectory, fileName);

//       // Save the file content to the specified path
//       fs.writeFileSync(filePath, fileContent, 'utf-8');

//       res.json({ message: 'File saved successfully' });
//   } catch (error) {
//       console.error('Error saving file:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

const secretKey = process.env.SECRET_KEY;

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                const token = jwt.sign({ email: user.email }, secretKey);
                console.log(user._id)
                res.json({ token, userId: user._id });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
        });

        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new project
app.post('/create-project/:userId', async (req, res) => {
    const {userId} = req.params;
    const {fileName, fileContent } = req.body;
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newProject = {
          fileName,
          fileContent,
      };
      user.projects.push(newProject);
      await user.save();

      // Fetch the newly added project from the user's projects array
      const savedProject = user.projects[user.projects.length - 1];

      // Extract the projectId from the saved project
      const projectId = savedProject._id;
      console.log(projectId);
  
      res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch user's projects
app.get('/user-projects/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const projects = user.projects;
      res.status(200).json({ projects });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Open a particular project
app.get('/open-project/:userId/:projectId', async (req, res) => {
    const { userId, projectId } = req.params;
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const project = user.projects.id(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.status(200).json({ project });
    } catch (error) {
      console.error('Error opening project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/update-project/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  const { fileName, fileContent, bytecode, rgbImage, vulnerabilities } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update the project details
    project.fileName = fileName;
    project.fileContent = fileContent;
    project.bytecode = bytecode;
    project.rgbImage = rgbImage;
    project.vulnerabilities = vulnerabilities;

    await user.save();

    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(3001,() => {
  console.log("server is running")
})