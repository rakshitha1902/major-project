import React, { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from './ProjectCard'; // Import the ProjectCard component
import { Card, Button } from 'react-bootstrap'; // Import CardDeck component for layout


function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // Fetch user's projects
    axios.get(`http://localhost:3001/user-projects/${userId}`)
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
          // Read the file content
          const reader = new FileReader();
          reader.onload = async (e) => {
            const fileContent = e.target.result;

            // Create a new project on the server with the uploaded file
            const response = await axios.post(`http://localhost:3001/create-project/${userId}`, {
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

  return (
    <div style={styles.dashboard}>
      <div className=' m-3 mb-5 d-flex justify-content-between'>
        <h2>DASHBOARD</h2>
        <h4 >{userName}</h4>
      </div>
      <Card className='m-3 mt-5'><Button variant="secondary" onClick={handleNewProjectClick}><h5>Create a New Project</h5></Button></Card>

      <h4 className='m-3 mt-5'>YOUR PROJECTS:</h4>
      <Card className='border-0'>
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            project={project}
            userId={userId}
            onOpenProjectClick={handleOpenProjectClick}
            style={styles.projectCard}
          />
        ))}
      </Card>
    </div>
  );
}

export default Dashboard;

const styles = {
  dashboard: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  projectCard: {
    width: '100%',
    marginBottom: '20px',
  },
 };