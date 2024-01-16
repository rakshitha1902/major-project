const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');

router.post('/compile', detectionController.compileContract);
router.post('/generate-image', detectionController.generateImage);
router.post('/detect-vulnerabilties', detectionController.detectVulnerabilties)

module.exports = router;
