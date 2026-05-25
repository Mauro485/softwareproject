const mongoose = require('mongoose');

const activityResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  option: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  solvedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityResult', activityResultSchema);
