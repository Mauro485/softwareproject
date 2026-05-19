const jwt = require('jsonwebtoken');

// Create a valid teacher token
const token = jwt.sign(
  {
    userId: '6a0a4dc04a4e9c8252c87e8d', // Need the teacher's ObjectId... let's just query the DB for a teacher
    email: 'docente@correo.com',
    role: 'teacher'
  },
  'your_jwt_secret_key_change_this_in_production', // from .env
  { expiresIn: '1h' }
);
console.log('Token:', token);
