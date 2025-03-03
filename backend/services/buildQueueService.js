const Application = require('../models/Application');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service to manage the build queue with rate limiting
 */
class BuildQueueService {
  constructor() {
    // Queue configuration
    this.queue = [];
    this.processing = false;
    this.rateLimit = {
      maxRequestsPerMinute: 5, // Adjust based on your API limits
      requestsThisMinute: 0,
      lastResetTime: Date.now()
    };
    
    // Configure the builder
    this.builder = require('./schedulerService');
    
    // Stats tracking
    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      lastProcessedTime: null,
      averageProcessingTime: 0
    };
  }
  
  /**
   * Start the queue processor
   */
  start() {
    if (!this.intervalId) {
      console.log('Starting build queue processor');
      this.intervalId = setInterval(() => this.processQueue(), 5000); // Check every 5 seconds
      
      // Reset rate limit counter every minute
      this.rateLimitResetInterval = setInterval(() => {
        this.rateLimit.requestsThisMinute = 0;
        this.rateLimit.lastResetTime = Date.now();
      }, 60000);
    }
  }
  
  /**
   * Stop the queue processor
   */
  stop() {
    if (this.intervalId) {
      console.log('Stopping build queue processor');
      clearInterval(this.intervalId);
      clearInterval(this.rateLimitResetInterval);
      this.intervalId = null;
      this.rateLimitResetInterval = null;
    }
  }
  
  /**
   * Add an app to the build queue
   * @param {string} appId - The application ID
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Queue position info
   */
  async queueBuild(appId, options = {}) {
    // Check if app exists
    const app = await Application.findById(appId);
    if (!app) {
      throw new Error(`Application with ID ${appId} not found`);
    }
    
    // Check if already in queue
    const existingIndex = this.queue.findIndex(item => item.appId === appId);
    if (existingIndex !== -1) {
      // If already in queue but not processing, update priority
      if (options.priority === 'high') {
        this.queue[existingIndex].priority = 'high';
        
        // Move high priority items to the front of the queue
        if (existingIndex > 0) {
          const item = this.queue.splice(existingIndex, 1)[0];
          
          // Find the last high priority item
          let insertIndex = 0;
          for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].priority === 'high') {
              insertIndex = i + 1;
            } else {
              break;
            }
          }
          
          this.queue.splice(insertIndex, 0, item);
        }
      }
      
      return {
        status: 'already-queued',
        position: existingIndex + 1,
        queueLength: this.queue.length,
        estimatedStartTime: this._calculateEstimatedStartTime(existingIndex)
      };
    }
    
    // Add to queue
    const queueItem = {
      appId,
      app: app,
      addedAt: new Date(),
      options: options || {},
      priority: options.priority || 'normal',
      status: 'queued'
    };
    
    // Handle priority (high priority items go to front of queue)
    if (queueItem.priority === 'high') {
      // Find position after other high priority items
      let insertIndex = 0;
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].priority === 'high') {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      this.queue.splice(insertIndex, 0, queueItem);
    } else {
      // Regular priority, add to the end
      this.queue.push(queueItem);
    }
    
    // Update app status
    app.status = 'queued';
    if (!app.queueData) app.queueData = {};
    app.queueData.queuedAt = new Date();
    app.queueData.priority = queueItem.priority;
    await app.save();
    
    // Ensure processor is running
    this.start();
    
    // Return queue position info
    const position = this.queue.findIndex(item => item.appId === appId) + 1;
    
    return {
      status: 'queued',
      position: position,
      queueLength: this.queue.length,
      estimatedStartTime: this._calculateEstimatedStartTime(position - 1)
    };
  }
  
  /**
   * Process the next item in the queue (if rate limit allows)
   * @private
   */
  async processQueue() {
    // Check if already processing
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    // Reset rate limit if minute has passed
    if (Date.now() - this.rateLimit.lastResetTime > 60000) {
      this.rateLimit.requestsThisMinute = 0;
      this.rateLimit.lastResetTime = Date.now();
    }
    
    // Check if we've hit rate limit
    if (this.rateLimit.requestsThisMinute >= this.rateLimit.maxRequestsPerMinute) {
      console.log(`Rate limit reached (${this.rateLimit.requestsThisMinute}/${this.rateLimit.maxRequestsPerMinute}). Waiting...`);
      return;
    }
    
    // We're good to process next item
    this.processing = true;
    
    // Get next item from queue
    const item = this.queue.shift();
    if (!item) {
      this.processing = false;
      return;
    }
    
    console.log(`Processing build for app: ${item.app.title} (ID: ${item.appId})`);
    
    try {
      // Mark app as building
      const app = await Application.findById(item.appId);
      if (!app) {
        throw new Error(`App ${item.appId} no longer exists`);
      }
      
      app.status = 'in-progress';
      if (!app.queueData) app.queueData = {};
      app.queueData.startedAt = new Date();
      await app.save();
      
      // Track for rate limiting
      this.rateLimit.requestsThisMinute++;
      
      // Start tracking processing time
      const startTime = Date.now();
      
      // Process the build
      if (item.options.buildNow) {
        // Use direct build
        await this._buildNow(app, item.options);
      } else {
        // Use scheduled build
        await this.builder.processScheduledApp(app);
      }
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update stats
      this.stats.totalProcessed++;
      this.stats.successful++;
      this.stats.lastProcessedTime = new Date();
      
      // Update average processing time using exponential moving average
      if (this.stats.averageProcessingTime === 0) {
        this.stats.averageProcessingTime = processingTime;
      } else {
        // 80% previous average, 20% new value
        this.stats.averageProcessingTime = 
          this.stats.averageProcessingTime * 0.8 + processingTime * 0.2;
      }
      
      console.log(`Successfully built app ${app.title} (${processingTime}ms)`);
    } catch (error) {
      console.error(`Error building app ${item.appId}:`, error);
      
      this.stats.totalProcessed++;
      this.stats.failed++;
      
      // Update app status
      try {
        const app = await Application.findById(item.appId);
        if (app) {
          app.status = 'error';
          if (!app.queueData) app.queueData = {};
          app.queueData.error = error.message;
          app.queueData.failedAt = new Date();
          await app.save();
        }
      } catch (dbError) {
        console.error('Error updating app status:', dbError);
      }
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Build app immediately
   * @private
   */
  async _buildNow(app, options) {
    console.log(`Starting immediate build for ${app.title}`);
    
    // Determine what kind of project to build based on the prompt
    const prompt = app.promptUsed;
    const shouldCreateStructured = /frontend|backend|fullstack/i.test(prompt);
    
    // Get the project generator
    const StructuredProjectGenerator = require('../lib/structuredProjectGenerator');
    const projectGenerator = new StructuredProjectGenerator();
    
    if (shouldCreateStructured) {
      // Generate structured project
      const result = await projectGenerator.generateStructuredProject({
        name: app.title,
        prompt: app.promptUsed,
        outputDir: app.path,
        includeBackend: true,
        includeFrontend: true
      });
      
      // Update app with structure information
      app.structure = result.structure;
    } else {
      // Generate simple project
      const codeGen = projectGenerator.codeGenerator;
      await codeGen._generateBasicProjectStructure(app.title, app.path, app.promptUsed);
    }
    
    // Mark app as complete
    app.status = 'completed';
    if (!app.queueData) app.queueData = {};
    app.queueData.completedAt = new Date();
    
    // Save the updated app
    await app.save();
    
    return { success: true };
  }
  
  /**
   * Calculate the estimated start time for an item at the given queue position
   * @private
   */
  _calculateEstimatedStartTime(position) {
    // If no items have been processed yet, use a default estimate
    const avgTime = this.stats.averageProcessingTime || 30000; // Default 30s if no data
    
    // Calculate how many minutes until it starts
    // Based on position and rate limits
    const itemsPerMinute = Math.min(this.rateLimit.maxRequestsPerMinute, 5);
    const minutesUntilStart = Math.ceil(position / itemsPerMinute);
    
    // Calculate the timestamp
    const estimatedStart = new Date(Date.now() + (minutesUntilStart * 60000));
    
    return estimatedStart;
  }
  
  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      rateLimit: {
        ...this.rateLimit,
        resetsIn: 60 - Math.floor((Date.now() - this.rateLimit.lastResetTime) / 1000)
      },
      stats: this.stats,
      queue: this.queue.map(item => ({
        appId: item.appId,
        appName: item.app.title,
        priority: item.priority,
        addedAt: item.addedAt
      }))
    };
  }
}

// Export a singleton instance
module.exports = new BuildQueueService();
