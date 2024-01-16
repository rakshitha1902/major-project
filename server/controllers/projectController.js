const UserModel = require('../models/User'); // Assuming UserModel is defined in a separate file

exports.createProject = async (req, res) => {
    const { userId } = req.params;
    const { fileName, fileContent } = req.body;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newProject = {
            fileName,
            fileContent,
        };

        user.projects.push(newProject);
        await user.save();

        // Fetch the newly added project from the user's projects array
        const savedProject = user.projects[user.projects.length - 1];

        // Extract the projectId from the saved project
        const projectId = savedProject._id;

        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserProjects = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const projects = user.projects;
        const userName = user.name;
        res.status(200).json({ projects, userName });
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.openProject = async (req, res) => {
    const { userId, projectId } = req.params;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const project = user.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ project });
    } catch (error) {
        console.error('Error opening project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProject = async (req, res) => {
    const { userId, projectId } = req.params;
    const { fileName, fileContent, bytecode, rgbImage, vulnerabilities } = req.body;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const project = user.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update the project details
        project.fileName = fileName;
        project.fileContent = fileContent;
        project.bytecode = bytecode;
        project.rgbImage = rgbImage;
        project.vulnerabilities = vulnerabilities;

        await user.save();

        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteProject = async (req, res) => {
    const { userId, projectId } = req.params;

    try {
        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            // If the user is not found, return a 404 error
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the project within the user's projects array
        const project = user.projects.id(projectId);
        if (!project) {
            // If the project is not found, return a 404 error
            return res.status(404).json({ error: 'Project not found' });
        }

        // Remove the project from the user's projects array
        user.projects.pull(project);

        // Save the user document to persist the changes
        await user.save();

        // Return a success response
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        // Log the error and return a 500 internal server error response
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};