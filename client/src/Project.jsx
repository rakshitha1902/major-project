import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Form } from 'react-bootstrap';


function Project() {
  const { userId, projectId } = useParams();
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [bytecode, setBytecode] = useState('');
  const [rgbImage, setRgbImage] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    // If projectId is provided, fetch project details
    if (projectId !== undefined) {
      axios.get(`http://localhost:3001/open-project/${userId}/${projectId}`)
        .then(response => {
          const { project } = response.data;

          // Check if project is found
          if (!project) {
            console.error('Project not found');
            return;
          }

          const { fileName, fileContent, bytecode, rgbImage, vulnerabilities} = project;
          setFileName(fileName);
          setFileContent(fileContent);
          setBytecode(bytecode);
          setRgbImage(rgbImage);
          setVulnerabilities(vulnerabilities);
          }
          )
        .catch(error => console.error('Error fetching project details:', error));
    }
  }, [userId, projectId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);
      setBytecode('');
      setRgbImage('');
      setVulnerabilities([]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };

      reader.readAsText(file);
    }
  };

  const handleCompileClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/compile', {
        fileName: fileName,
        fileContent: fileContent,
      });

      if (response.data) {
        setBytecode(response.data.bytecode);
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

  const handleDetectVulnerabilitiesClick = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/detect-vulnerabilities',
        { rgbImage: rgbImage }
      );

      if (response.data) {
        setVulnerabilities(response.data);
      } else {
        console.error('Server returned an error:', response.statusText);
      }
    } catch (error) {
      console.error('Error during vulnerability detection:', error);
    }
  };

  const saveProject = () => {
    // Send a request to update the project with the latest changes
    axios.post(`http://localhost:3001/update-project/${userId}/${projectId}`, {
      fileName,
      fileContent,
      bytecode,
      rgbImage,
      vulnerabilities
    })
    .then(response => {
      console.log('Project saved successfully:', response.data);
      // Handle any additional logic after project save
      alert('Project saved successfully!');
    })
    .catch(error => {
      console.error('Error saving project:', error);
      alert('Could not save the project. Please try again.');
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container p-4 rounded" style={{  boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 className="mb-5 text-dark text-center">{fileName}</h2>
        <Container className="mt-3">
          <Form.Group className="mb-3">
            {/* <Form.Label>Choose a file:</Form.Label> */}
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>
        </Container>
        {/* {fileName && <p className="m-3 text-dark text-center">Selected File: {fileName}</p>} */}
        {fileContent && (
          <div>
            <h4 className="m-3 text-secondary ">Edit Your Code</h4>
            <MonacoEditor
              width="100%"
              height="500"
              language="solidity"
              theme="vs-dark"
              value={fileContent}
              onChange={newContent => setFileContent(newContent)}
            />
            <div className="d-flex justify-content-between mt-3">
              <button onClick={handleCompileClick} className="btn btn-secondary mt-3 mb-4">
                Compile Code
              </button>
            </div>
            {bytecode && (
              <div className="mt-3">
                <h4 className="mb-3 text-dark ">Bytecode</h4>
                <pre>{bytecode}</pre>
                <button onClick={handleGenerateImageClick} className="btn btn-secondary mt-5 mb-4">
                  Generate Image
                </button>
                {rgbImage && (
                  <div className="mt-3">
                    <div>
                      <h4 className="mb-3 text-dark">RGB Image</h4>
                      <img
                        src={`data:image/png;base64,${rgbImage}`}
                        alt="RGB Image"
                        style={{ width: '25%', height: 'auto' }}
                        className="mx-auto"
                      />
                    </div>
                    <button onClick={handleDetectVulnerabilitiesClick} className="btn btn-secondary mt-5 mb-4">Detect Vulnerabilities</button>
                    {vulnerabilities.length > 0 && (
                      <div>
                        <h4>Vulnerabilities Detected:</h4>
                        <ul>
                          {vulnerabilities
                            .filter((vulnerability) => vulnerability.value === 1)
                            .map((vulnerability, index) => (
                              <li key={index}>
                                {vulnerability.category}
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3">
              <button onClick={saveProject} className="btn btn-success mt-3">
                Save Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Project;
