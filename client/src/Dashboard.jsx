import React, { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from './ProjectCard'; // Import the ProjectCard component
import { Card, Button, Container, Row, Col } from 'react-bootstrap';


function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // Fetch user's projects
    axios.get(`http://localhost:3001/project/user-projects/${userId}`)
      .then(response => {
        const userProjects = response.data.projects || [];
        const username = response.data.userName;
        setProjects(userProjects);
        setUserName(username);
      })
      .catch(error => console.error('Error fetching projects:', error));
  }, [userId]);

  const handleNewProjectClick = async () => {
    try {
      // Create an input element to trigger file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.sol'; // You can adjust the accepted file types

      // Listen for file selection
      input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          // Read the file 
          // content
          const reader = new FileReader();
          reader.onload = async (e) => {
            const fileContent = e.target.result;

            // Create a new project on the server with the uploaded file
            const response = await axios.post(`http://localhost:3001/project/create-project/${userId}`, {
              fileName: file.name,
              fileContent,
            });

            // Redirect to the new project with userId and projectId
            const projectId = response.data.projectId;  // Assuming the server returns the created project ID
            console.log(projectId);
            navigate(`/project/${userId}/${projectId}`);
          };

          reader.readAsText(file);
        }
      });

      // Trigger the file input click programmatically
      input.click();
    } catch (error) {
      console.error('Error creating new project:', error);
    }
  };

  const handleOpenProjectClick = (projectId) => {
    // Redirect to the project component with userId and projectId
    navigate(`/project/${userId}/${projectId}`);
  };

  const handleDeleteProjectClick = async (projectId) => {
    try {
      // Send a request to delete the project on the server
      await axios.delete(`http://localhost:3001/project/delete-project/${userId}/${projectId}`);
  
      // Update the projects state to remove the deleted project
      setProjects((prevProjects) => prevProjects.filter((p) => p._id !== projectId));
      alert(`Project deleted successfully.`);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  

  return (
    <Container fluid className="text-light p-4" style={{backgroundColor:"#1a1a1a"}}>
      <Row className="mb-4 m-2">
        <Col xs={6}>
          <h2>DASHBOARD</h2>
        </Col>
        <Col xs={6} className='text-end'>
          <h4>{userName}</h4>
        </Col>
      </Row>
      <Card text="light" className="m-3" style={{backgroundColor:"#1a1a1a"}}>
          <Button variant="dark" onClick={handleNewProjectClick}>
            <h5>Create a New Project</h5>
          </Button>
      </Card>

      <h4 className='m-3 mt-5'>YOUR PROJECTS:</h4>
      <Card className='border-0 text-light' style={{backgroundColor:"#1a1a1a"}}>
      {projects.map((project, index) => (
        <ProjectCard
          key={index}
          project={project}
          userId={userId}
          onOpenProjectClick={handleOpenProjectClick}
          onDeleteProjectClick={handleDeleteProjectClick}
        />
      ))}
      </Card>
    </Container>
  );
}

export default Dashboard;
