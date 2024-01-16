const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/create-project/:userId', projectController.createProject);
router.get('/user-projects/:userId', projectController.getUserProjects);
router.get('/open-project/:userId/:projectId', projectController.openProject);
router.post('/update-project/:userId/:projectId', projectController.updateProject);
router.delete('/delete-project/:userId/:projectId', projectController.deleteProject);

module.exports = router;
