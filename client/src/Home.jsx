import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';

function Home() {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [bytecode, setBytecode] = useState('');
  const [rgbImage, setRgbImage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };

      reader.readAsText(file);
    }
  };

  const handleCompileClick = async () => {
    try {
      const response = await fetch('http://localhost:3001/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName,
          fileContent: fileContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBytecode(result.bytecode);
      } else {
        console.error('Server returned an error:', response.statusText);
      }
    } catch (error) {
      console.error('Error during compilation:', error);
    }
  };

  const handleGenerateImageClick = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/generate-image',
        { bytecode: bytecode },
        { responseType: 'arraybuffer' }
      );
  
      if (response.data) {
        // Convert binary image data to base64 for displaying in the <img> tag
        const base64Image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        setRgbImage(base64Image);
      } else {
        console.error('Server returned an error:', response.statusText);
      }
    } catch (error) {
      console.error('Error during image generation:', error);
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container p-4 rounded" style={{ maxWidth: '800px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 className="mb-4 text-primary text-center">Home Component</h2>
        <div className="mb-3">
          <input type="file" onChange={handleFileChange} className="form-control-file" />
        </div>
        {fileName && <p className="mb-3 text-success text-center">Selected File: {fileName}</p>}
        {fileContent && (
          <div>
            <h3 className="mb-3 text-info text-center">Monaco Editor</h3>
            <MonacoEditor
              width="100%"
              height="400"
              language="javascript"
              theme="vs-dark"
              value={fileContent}
            />
            <button onClick={handleCompileClick} className="btn btn-primary mt-3">
              Compile Code
            </button>
            {bytecode && (
              <div className="mt-3">
                <h4 className="mb-3 text-info text-center">Bytecode</h4>
                <pre>{bytecode}</pre>
                <button onClick={handleGenerateImageClick} className="btn btn-success mt-3">
                  Generate Image
                </button>
                {rgbImage && (
                  <div className="mt-3 text-center">
                    <h4 className="mb-3 text-success text-center">RGB Image</h4>
                    <img
                      src={`data:image/png;base64,${rgbImage}`}
                      alt="RGB Image"
                      style={{ width: '25%', height: 'auto' }}
                      className="mx-auto"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
