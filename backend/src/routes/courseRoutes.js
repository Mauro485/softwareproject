const express = require('express');
const { getCourses, getCourseById, createCourse, enrollStudent, createModule, createActivity, getModuleStudy, evaluateModule, getModuleProgress, getTeacherStudents, getEnrolledCourses, getCourseStudentsProgress, getTeacherCourses, updateCourse, deleteCourse, updateModule, deleteModule } = require('../controllers/courseController');
const teacherMiddleware = require('../middleware/teacherMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');

const router = express.Router();

// GET all courses
router.get('/', getCourses);

// POST create new course (only teachers)
router.post('/', teacherMiddleware, createCourse);

// GET course by ID
router.get('/:id', getCourseById);

// GET student's enrolled courses
router.get('/student/enrolled', authMiddleware, getEnrolledCourses);

// POST enroll student
router.post('/:id/enroll', optionalAuthMiddleware, enrollStudent);

// POST add module to course (only teachers)
router.post('/:id/modules', teacherMiddleware, createModule);

// POST add activity to module (only teachers)
router.post('/:id/modules/:moduleId/activities', teacherMiddleware, createActivity);

// GET module for studying (strips answers)
router.get('/:id/modules/:moduleId/study', optionalAuthMiddleware, getModuleStudy);

// POST evaluate module (CU-7)
router.post('/:id/modules/:moduleId/evaluate', optionalAuthMiddleware, evaluateModule);

// GET module progress
router.get('/:id/modules/:moduleId/progress', authMiddleware, getModuleProgress);

// GET teacher's enrolled students
router.get('/teacher/students', teacherMiddleware, getTeacherStudents);

// GET students progress for a specific course
router.get('/:id/students-progress', teacherMiddleware, getCourseStudentsProgress);

// GET teacher's created courses
router.get('/teacher/courses', teacherMiddleware, getTeacherCourses);

// PUT update a course (only teachers)
router.put('/:id', teacherMiddleware, updateCourse);

// DELETE a course (only teachers)
router.delete('/:id', teacherMiddleware, deleteCourse);

// PUT update a module (only teachers)
router.put('/:id/modules/:moduleId', teacherMiddleware, updateModule);

// DELETE a module (only teachers)
router.delete('/:id/modules/:moduleId', teacherMiddleware, deleteModule);

module.exports = router;
