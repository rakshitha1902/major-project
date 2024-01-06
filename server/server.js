const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/predict', upload.single('image'), (req, res) => {
  try {
    const imgBuffer = req.file.buffer;

    // Save the image to a temporary file
    const tempImagePath = 'temp_image.jpg';
    fs.writeFileSync(tempImagePath, imgBuffer);

    // Run the Python script 
    const pythonProcess = spawn('python', ['predict.py', tempImagePath]);

    let data = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk;
    });

    pythonProcess.on('close', (code) => {
      // Parse the output data
      const result = JSON.parse(data);

      // Respond with the prediction
      res.json(result);

      // Clean up: Remove the temporary image file
      fs.unlinkSync(tempImagePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
