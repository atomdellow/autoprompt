const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: String,
  isLatest: Boolean,
  releaseDate: Date,
  isLTS: Boolean
});

const technologyStackSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'both', 'database', 'devops', 'testing'],
    required: true
  },
  type: {
    type: String,
    enum: ['language', 'framework', 'library', 'database', 'tool'],
    required: true
  },
  versions: [versionSchema],
  currentStableVersion: String,
  latestVersion: String,
  description: String,
  dependencies: [{
    name: String,
    versions: [String]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TechnologyStack', technologyStackSchema);
