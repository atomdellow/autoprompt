const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
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

// Add helper method for scheduling
ApplicationSchema.methods.schedule = function(options) {
  const { dateTime, priority = 'medium', repeat = false, repeatFrequency, repeatInterval } = options;
  
  this.scheduled = new Date(dateTime);
  this.status = 'scheduled';
  
  this.scheduling = {
    scheduledDateTime: new Date(dateTime),
    status: 'pending',
    priority,
    nextRun: new Date(dateTime),
    repeat,
    repeatFrequency,
    repeatInterval
  };
  
  return this.save();
};

// Add helper method for prompt history
ApplicationSchema.methods.addPromptToHistory = function(prompt, changes = []) {
  if (!this.promptHistory) {
    this.promptHistory = [];
  }
  
  this.promptHistory.push({
    prompt,
    timestamp: new Date(),
    changes
  });
  
  return this.save();
};

// Add helper method to install packages
ApplicationSchema.methods.installPackage = function(packageName, version = 'latest', target) {
  // Store the package installation record
  // This could be expanded to store actual package records
  const installRecord = {
    package: packageName,
    version,
    target,
    installedAt: new Date()
  };
  
  // Add to a packages array if you want to track installed packages
  // if (!this.packages) this.packages = [];
  // this.packages.push(installRecord);
  
  return this.save();
};

module.exports = mongoose.model('Application', ApplicationSchema);
