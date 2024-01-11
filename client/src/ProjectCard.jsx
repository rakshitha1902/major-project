import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProjectCard = ({ project, userId, onOpenProjectClick }) => {
 return (
    <Card className="project-card m-3 p-0">
      <Card.Body>
        <Card.Header><Card.Title>{project.fileName}</Card.Title></Card.Header>
        <Card.Text>Last Updated: {new Date(project.updatedAt).toLocaleString()}</Card.Text>
        <Button variant="secondary" onClick={() => onOpenProjectClick(project._id)}>Open Project</Button>
      </Card.Body>
    </Card>
 );
};

export default ProjectCard;