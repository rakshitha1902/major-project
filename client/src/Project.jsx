import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';




function Project() {
  const { userId, projectId } = useParams();
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [bytecode, setBytecode] = useState('');
  const [rgbImage, setRgbImage] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    // If projectId is provided, fetch project details
    if (projectId !== undefined) {
      axios.get(`http://localhost:3001/project/open-project/${userId}/${projectId}`)
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
      const response = await axios.post('http://localhost:3001/detect/compile', {
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

  // const handleGenerateImageClick = async () => {
  //   try {
  //     const response = await axios.post(
  //       'http://localhost:3001/detect/generate-image',
  //       { bytecode: bytecode },
  //       { responseType: 'arraybuffer' }
  //     );

  //     if (response.data) {
  //       // Convert binary image data to base64 for displaying in the <img> tag
  //       // console.log(response.data)
  //       const base64Image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
  //       setRgbImage(base64Image);
  //       console.log(rgbImage);
  //     } else {
  //       console.error('Server returned an error:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error during image generation:', error);
  //   }
  // };

  // const handleDetectVulnerabilitiesClick = async () => {
  //   try {
  //     await handleGenerateImageClick();
  //     const response = await axios.post(
  //       'http://localhost:3001/detect/detect-vulnerabilties',
  //       { rgbImage: rgbImage }
  //     );

  //     if (response.data) {
  //       setVulnerabilities(response.data);
  //     } else {
  //       console.error('Server returned an error:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error during vulnerability detection:', error);
  //   }
  // };
  const handleGenerateImageClick = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          'http://localhost:3001/detect/generate-image',
          { bytecode: bytecode },
          { responseType: 'arraybuffer' }
        );
  
        if (response.data) {
          const base64Image = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          setRgbImage(base64Image);
          resolve(base64Image);
        } else {
          console.error('Server returned an error:', response.statusText);
          reject();
        }
      } catch (error) {
        console.error('Error during image generation:', error);
        reject();
      }
    });
  };
  
  
  const handleDetectVulnerabilitiesClick = () => {
    setIsLoading(true);
    setButtonClicked(true);
    handleGenerateImageClick().then(async (rgbImage) => {
      try {
        const response = await axios.post(
          'http://localhost:3001/detect/detect-vulnerabilties',
          { rgbImage: rgbImage }
        );
  
        if (response.data) {
          setVulnerabilities(response.data);
        } else {
          console.error('Server returned an error:', response.statusText);
        }
      } catch (error) {
        console.error('Error during vulnerability detection:', error);
      }finally {
        // Set loading state to false regardless of success or error
        setIsLoading(false);
      }
    });
  };
  
  

  const saveProject = () => {
    // Send a request to update the project with the latest changes
    axios.post(`http://localhost:3001/project/update-project/${userId}/${projectId}`, {
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

  const generatePdfReport = () => {
    const pdf = new jsPDF();
    let currentY = 20; // Initial Y coordinate
    let currentPage = 1;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const yOffset = 20;
  
    // Function to add text with a specified style (font size, color, etc.)
    const addTextWithStyle = (text, width, style) => {
      const lines = pdf.splitTextToSize(text, width);
      const remainingSpace = pageHeight - currentY;
  
      if (remainingSpace < lines.length * 10) {
        pdf.addPage();
        currentY = yOffset; // Reset Y coordinate for the new page
        currentPage++;
      }
  
      // Apply the specified style
      pdf.setFont(style.fontStyle, style.fontSize);
      pdf.setTextColor(style.textColor);
  
      pdf.text(lines, 20, currentY);
      currentY += lines.length * 10; // Adjust line height as needed
  
      // Reset the style to default
      pdf.setFont('times', 'normal', 12);
      pdf.setTextColor(0);
    };
  
    // Example of a heading style
    const headingStyle = {
      // fontName: 'times',       // Font family
      fontStyle: 'bold',       // Font style (normal, bold, italic)
      fontSize: 16,            // Font size
      textColor: 0,            // Text color (black)
    };
  
    // Example of regular text style
    const regularTextStyle = {
      // fontName: 'times',
      fontStyle: 'normal',
      fontSize: 12,
      textColor: 0,
    };
  
    // Add highlighted headings and content
    addTextWithStyle(`File Name: ${fileName}`, 180, headingStyle);
    addTextWithStyle(`File Content:`, 180, headingStyle);
    addTextWithStyle(fileContent, 180, regularTextStyle);
    addTextWithStyle(`Bytecode:`, 180, headingStyle);
    addTextWithStyle(bytecode, 180, regularTextStyle);
  
    if (vulnerabilities.length > 0) {
      addTextWithStyle('Vulnerabilities Detected:', 180, headingStyle);
      vulnerabilities
        .filter((vulnerability) => vulnerability.value === 1)
        .forEach((vulnerability, index) => {
          const vulnerabilityText = `${index + 1}. ${vulnerability.category}`;
          addTextWithStyle(vulnerabilityText, 180, regularTextStyle);
        });
    } else {
      addTextWithStyle('No vulnerabilities detected.', 180, headingStyle);
    }
  
    // Save the PDF with a unique name (e.g., project_report_timestamp.pdf)
    const timestamp = new Date().toISOString().replace(/[-:]/g, '');
    pdf.save(`project_report_${timestamp}_page_${currentPage}.pdf`);
  };
  
  
  
  
  

  return (

      <div className="d-flex align-items-start" style={{ backgroundColor: '#1a1a1a', height: '100vh', color: '#fff', overflow: 'hidden'  }}>
        <div className="container m-3 mt-5 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.1)', backgroundColor: '#292929', marginRight: '20px', width: '340px' }}>
          <h3 className="mb-5 text-light text-center">{fileName}</h3>
          <Container className="mt-3" >
            <Form.Group className="mb-3">
              <Form.Control type="file" onChange={handleFileChange} style={{ background: '#333', color: '#fff' }} />
            </Form.Group>
            <div className="d-flex flex-column">
              <Button onClick={handleCompileClick} variant="secondary" className="mt-3 mb-2">
                Compile Code
              </Button>
              {/* <Button onClick={handleGenerateImageClick} variant="secondary" className="mb-2">
                Generate Image
              </Button> */}
              <Button onClick={handleDetectVulnerabilitiesClick} variant="secondary" className="mb-2">
                Detect Vulnerabilities
              </Button>
              
            </div>
            <div>
              {bytecode && (
                <div className='mt-3'>
                  <h4 className="mb-3 text-light">Bytecode</h4>
                  <pre style={{ background: '#333', color: '#fff' }}>{bytecode}</pre>
                </div>
              )}
              {/* {vulnerabilities.length > 0 && (
              <div className="mt-3">
                <h4>Vulnerabilities Detected:</h4>
                <ul>
                  {vulnerabilities
                    .filter((vulnerability) => vulnerability.value === 1)
                    .map((vulnerability, index) => (
                      <li key={index}>{vulnerability.category}</li>
                    ))}
                </ul>
              </div>
            )} */}
            {isLoading && <p>Detecting vulnerabilities...</p>}
            {!isLoading && vulnerabilities !== null && vulnerabilities.length === 0 && buttonClicked ? (
              <h4>No vulnerabilities detected.</h4>
            ) : (
              <div>
                {vulnerabilities !== null && vulnerabilities.length > 0 ? (
                  <div>
                    <h4>Vulnerabilities detected:</h4>
                    <ul>
                      {vulnerabilities
                        .filter((vulnerability) => vulnerability.value === 1)
                        .map((vulnerability, index) => (
                          <li key={index}>{vulnerability.category}</li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <h4>{!isLoading && buttonClicked ? "No vulnerabilities detected." : ""}</h4>
                )}
              </div>
            )}

            </div>
            <div className='d-flex justify-content-between'>
            <Button onClick={saveProject} variant="success" className="mt-3">
                Save Project
            </Button>
            <Button onClick={generatePdfReport} variant="light" className="mt-3">
              Generate Report
            </Button>
            </div>

          </Container>
        </div>
        <div className="d-flex flex-column align-items-start">
          {fileContent && (
            <div>
              <h4 className="m-3 text-light">EDIT YOUR CODE</h4>
              <MonacoEditor
                width="60rem"
                height="33rem"
                language="solidity"
                theme="vs-dark"
                value={fileContent}
                onChange={(newContent) => setFileContent(newContent)}
              />
            </div>
          )}
          {/* <div className="mt-3">
            {rgbImage && (
              <div className="mt-3">
                <h4 className="mb-3 text-light">RGB Image</h4>
                <img
                  src={`data:image/png;base64,${rgbImage}`}
                  alt="RGB Image"
                  style={{ width: '25%', height: 'auto' }}
                  className="mx-auto"
                />
              </div>
            )}
            
          </div> */}
        </div>
      </div>
      

  );
}

export default Project;
