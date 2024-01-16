const hre = require("hardhat");
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');


exports.compileContract =  async (req, res) => {
    try {
        const fileName = req.body.fileName;
        const fileContent = req.body.fileContent;
  
        // // Write the contract to a Solidity file
        // require('fs').writeFileSync(`../contracts/${fileName}`, fileContent);
        const filePath = path.join(__dirname, '..', 'contracts', fileName);
        require('fs').writeFileSync(filePath, fileContent);
  
        // Compile the contract using Hardhat
        await hre.run('compile');
  
        // Extract the contract name from the file content
        const contractName = fileContent.match(/contract\s+(\w+)\s*{/)[1];
  
        // Load the compiled contract
        const contractArtifact = require(`../artifacts/contracts/${fileName}/${contractName}.json`);
  
        // Extract the bytecode
        const bytecode = contractArtifact.bytecode;

  
        res.json({ bytecode: bytecode });
    } catch (error) {
        console.error('Error during compilation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.generateImage =  async (req, res) => {
  try {
      const { bytecode } = req.body;

      // Save the bytecode to a temporary file
      const tempFilePath = path.join(__dirname, 'temp.sol');
      fs.writeFileSync(tempFilePath, bytecode, 'utf-8');

      // Use the Python script to generate the image
      const pythonScriptPath = path.join(__dirname, 'generate_image.py');
      const pythonProcess = spawn('python', [pythonScriptPath, tempFilePath]);

      // const pythonProcess = spawn('python', ['generate_image.py', tempFilePath]);

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
              // console.log(imageData);
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
};

exports.detectVulnerabilties = async (req, res) => {
  try {
    const { rgbImage } = req.body;
    // console.log('rgbImage:', rgbImage);
    // Decode base64 encoded image data
    const imageData = Buffer.from(rgbImage, 'base64');

    // Save the image data to a temporary file
    const tempImagePath = path.join(__dirname, 'temp.png');
    // console.log('tempImagePath:', tempImagePath);
    fs.writeFileSync(tempImagePath, imageData);


    // Use the Python script to run vulnerability detection
    const pythonScriptPath = path.join(__dirname, 'predict.py');
    const pythonProcess = spawn('python', [pythonScriptPath, tempImagePath]);
    

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
};

