const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, email, password, role, teacherCode } = body;

    // Validar campos obligatorios
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Rol por defecto
    const userRole = role === 'teacher' ? 'teacher' : 'student';

    /* -------------------------
       VALIDACIÓN DOCENTE
    --------------------------*/
    if (userRole === 'teacher') {
      const validTeacherCode =
        process.env.TEACHER_REGISTRATION_CODE || 'DOC88';

      if (!teacherCode) {
        return res.status(400).json({
          message: 'El código docente es obligatorio'
        });
      }

      if (teacherCode !== validTeacherCode) {
        return res.status(403).json({
          message: 'Código docente inválido'
        });
      }
    }

    // Verificar usuario existente
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'El usuario ya existe'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    await newUser.save();

    // Respuesta segura
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse
    });

  } catch (error) {
    console.error('Error en registro:', error);

    return res.status(500).json({
      message: 'Error del servidor'
    });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Complete los campos para iniciar sesión'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no registrado'
      });
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Contraseña incorrecto, favor intente de nuevo'
      });
    }

    // Token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta segura
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);

    return res.status(500).json({
      message: 'Error del servidor'
    });
  }
};

/* =========================
   GET USERS
========================= */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    return res.status(200).json({
      users
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);

    return res.status(500).json({
      message: 'Error del servidor'
    });
  }
};

/* =========================
   GET TEACHERS
========================= */
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher'
    }).select('-password');

    return res.status(200).json({
      message: 'Docentes registrados',
      count: teachers.length,
      teachers
    });

  } catch (error) {
    console.error('Error al obtener docentes:', error);

    return res.status(500).json({
      message: 'Error del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getTeachers
};
