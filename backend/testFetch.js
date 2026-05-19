const jwt = require('jsonwebtoken');
const token = jwt.sign(
  {
    userId: '6a0a4dc04a4e9c8252c87e8d', // Need the teacher's ObjectId
    email: 'docente@correo.com',
    role: 'teacher'
  },
  'your_jwt_secret_key_change_this_in_production',
  { expiresIn: '1h' }
);
fetch('http://127.0.0.1:5000/api/courses/teacher/students', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => res.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
