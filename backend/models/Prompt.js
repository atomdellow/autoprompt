const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  description: String,
  tags: [String],
  category: {
    type: String,
    enum: ['general', 'frontend', 'backend', 'fullstack', 'mobile', 'other'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prompt', PromptSchema);
