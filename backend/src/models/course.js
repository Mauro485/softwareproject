const mongoose = require('mongoose');

// Schema for content items within modules
const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: String,
  imageUrl: String,
  videoUrl: String
});

// Schema for activity options
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

// Schema for activities within modules
const activitySchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  options: [optionSchema]
});

// Schema for modules within courses
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  contents: [contentSchema],
  activities: [activitySchema]
});

// Main Course Schema
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modules: [moduleSchema]
  },
  {
    timestamps: true
  }
);

// Export the Course model
module.exports = mongoose.model('Course', courseSchema);
