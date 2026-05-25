const cors = require('cors');
const express = require("express");
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Expose static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/achievements', achievementRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

module.exports = app;