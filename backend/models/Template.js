const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  structure: {
    type: String,
    required: true
  },
  technologies: {
    languages: [String],
    frameworks: [String],
    databases: [String],
    frontend: [String],
    backend: [String],
    testing: [String],
    devops: [String]
  },
  bestPractices: {
    designPatterns: [String],
    principles: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', TemplateSchema);
