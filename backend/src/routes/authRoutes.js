const express = require('express');
const { register, login, getUsers, getTeachers } = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para login
router.post('/login', login);

// Ruta para obtener todos los usuarios registrados
router.get('/users', getUsers);

// Ruta para obtener solo los docentes registrados
router.get('/teachers', getTeachers);

// Ruta para obtener perfil del usuario autenticado
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Acceso permitido",
    user: req.user
  });
});

module.exports = router;