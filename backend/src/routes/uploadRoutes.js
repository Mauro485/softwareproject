const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const teacherMiddleware = require('../middleware/teacherMiddleware');

const router = express.Router();

// POST upload file (only teachers can upload content)
router.post('/', teacherMiddleware, upload.single('file'), uploadFile);

module.exports = router;
