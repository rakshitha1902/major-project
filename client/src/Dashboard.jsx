import React, { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // Fetch user's projects
    axios.get(`http://localhost:3001/user-projects/${userId}`)
      .then(response => {
        const userProjects = response.data.projects || [];
        setProjects(userProjects);
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
    <div>
      <h2>Welcome to the Dashboard</h2>
      <button onClick={handleNewProjectClick}>Create a New Project</button>

      <h3>Your Projects:</h3>
      <div>
        {projects.map((project, index) => (
          <div key={index}>
            <h4>{project.fileName}</h4>
            <p>Last Updated: {new Date(project.updatedAt).toLocaleString()}</p>
            <button onClick={() => handleOpenProjectClick(project._id)}>Open Project</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
