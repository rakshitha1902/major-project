// import React from 'react';
// import { Card, Button } from 'react-bootstrap';

// const ProjectCard = ({ project, userId, onOpenProjectClick }) => {
//  return (
//     <Card className="project-card m-3 p-0 bg-dark text-light">
//       <Card.Body>
//         <Card.Header>
//           <Card.Title>{project.fileName}</Card.Title>
//         </Card.Header>
//         <Card.Text>Last Updated: {new Date(project.updatedAt).toLocaleString()}</Card.Text>
//         <Button variant="secondary" onClick={() => onOpenProjectClick(project._id)}>
//           Open Project
//         </Button>
//       </Card.Body>
//     </Card>
//   );
// };
// // style={{ boxShadow: '0 0 10px rgba(255,255,255,0.1)', backgroundColor: '#292929'}}

// export default ProjectCard;

import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProjectCard = ({ project, userId, onOpenProjectClick, onDeleteProjectClick }) => {
  return (
    <Card className="project-card m-3 p-0 bg-dark text-light">
      <Card.Body>
        <Card.Header>
          <Card.Title>{project.fileName}</Card.Title>
        </Card.Header>
        <Card.Text>Last Updated: {new Date(project.updatedAt).toLocaleString()}</Card.Text>
        <div className='d-flex justify-content-between'>
          <Button variant="secondary" className="mr-2" onClick={() => onOpenProjectClick(project._id)}>
            Open Project
          </Button>
          <Button variant="danger" onClick={() => onDeleteProjectClick(project._id)}>
            Delete Project
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
