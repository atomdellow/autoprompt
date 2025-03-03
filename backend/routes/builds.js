const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const buildQueueService = require('../services/buildQueueService');

// Start the build queue service when the routes are initialized
buildQueueService.start();

/**
 * Get build queue status
 */
router.get('/queue', async (req, res) => {
  try {
    const queueStatus = buildQueueService.getQueueStatus();
    res.json(queueStatus);
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({ 
      error: 'Failed to get queue status',
      message: error.message
    });
  }
});

/**
 * Build an app immediately
 */
router.post('/build-now/:id', async (req, res) => {
  try {
    const appId = req.params.id;
    const options = {
      buildNow: true,
      priority: req.body.priority || 'normal',
      force: req.body.force || false
    };
    
    // Queue the build
    const queueResult = await buildQueueService.queueBuild(appId, options);
    
    res.json({
      message: 'Build request submitted successfully',
      queueStatus: queueResult,
      appId
    });
  } catch (error) {
    console.error('Error submitting build:', error);
    res.status(500).json({ 
      error: 'Failed to submit build request',
      message: error.message
    });
  }
});

/**
 * Get app build status
 */
router.get('/status/:id', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if app is in the queue
    const queue = buildQueueService.getQueueStatus();
    const inQueue = queue.queue.find(item => item.appId === req.params.id);
    
    res.json({
      appId: app._id,
      status: app.status,
      queueData: app.queueData || {},
      inQueue: Boolean(inQueue),
      queuePosition: inQueue ? queue.queue.indexOf(inQueue) + 1 : null,
      queueLength: queue.queueLength,
      lastModified: app.lastModified,
      path: app.path
    });
  } catch (error) {
    console.error('Error getting build status:', error);
    res.status(500).json({ 
      error: 'Failed to get build status',
      message: error.message
    });
  }
});

/**
 * Set queue configuration
 */
router.post('/queue/config', async (req, res) => {
  try {
    // Only allow admin users to change queue config
    if (req.body.rateLimit) {
      buildQueueService.rateLimit.maxRequestsPerMinute = req.body.rateLimit;
    }
    
    res.json({
      message: 'Queue configuration updated',
      config: {
        rateLimit: buildQueueService.rateLimit.maxRequestsPerMinute
      }
    });
  } catch (error) {
    console.error('Error updating queue config:', error);
    res.status(500).json({ 
      error: 'Failed to update queue configuration',
      message: error.message
    });
  }
});

module.exports = router;
