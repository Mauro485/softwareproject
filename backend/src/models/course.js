const mongoose = require('mongoose');

// Schema for content items within modules
const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'youtube'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: String,
  imageUrl: String,
  videoUrl: String,
  youtubeUrl: String
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

// Schema for Drag and Drop pairs
const dragDropPairSchema = new mongoose.Schema({
  draggable: { type: String, required: true },
  target: { type: String, required: true }
});

// Schema for activities within modules
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'drag_drop', 'simulator'],
    default: 'multiple_choice'
  },
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  // Fields for multiple choice
  options: [optionSchema],
  // Fields for drag and drop
  dragDropPairs: [dragDropPairSchema],
  // Fields for simulator
  simulatorMode: { 
    type: String, 
    enum: ['exact_command', 'create_repo', 'make_commit'],
    default: 'exact_command' 
  },
  simulatorExpectedCommand: { type: String }
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
