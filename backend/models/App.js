const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Make sure the App schema is correctly defined
const AppSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  path: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'scheduled', 'archived', 'error'],
    default: 'planned'
  },
  scheduled: {
    type: Date
  },
  languages: [String],
  frameworks: [String],
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template'
  },
  promptId: {
    type: Schema.Types.ObjectId,
    ref: 'Prompt'
  },
  promptContent: String,
  promptUsed: String,
  promptHistory: [{
    prompt: String,
    timestamp: Date,
    changes: [String]
  }],
  errorMessage: String,
  deletionScheduled: {
    date: Date,
    reason: String
  },
  scheduling: {
    scheduledDateTime: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    nextRun: Date,
    repeat: Boolean,
    repeatFrequency: String,
    repeatInterval: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('App', AppSchema);
