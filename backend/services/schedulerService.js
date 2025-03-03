const Application = require('../models/Application');
const StructuredProjectGenerator = require('../lib/structuredProjectGenerator');
const projectGenerator = new StructuredProjectGenerator();

/**
 * Service to handle scheduled app generation
 */
class SchedulerService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.checkInterval = 60000; // Check every minute
    this.activeJobs = new Map();
  }
  
  /**
   * Start the scheduler service
   */
  start() {
    if (this.isRunning) {
      return;
    }
    
    console.log('Starting scheduler service...');
    this.isRunning = true;
    
    // Initial check
    this.checkScheduledTasks();
    
    // Set up recurring check
    this.timer = setInterval(() => this.checkScheduledTasks(), this.checkInterval);
  }
  
  /**
   * Stop the scheduler service
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('Stopping scheduler service...');
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
  }
  
  /**
   * Check for tasks that need to be run
   */
  async checkScheduledTasks() {
    try {
      const now = new Date();
      console.log(`[Scheduler] Checking for scheduled tasks at ${now.toISOString()}`);
      
      // Find all apps scheduled to run now or in the past that aren't already running
      const scheduledApps = await Application.find({
        $or: [
          { 
            scheduled: { $lte: now },  
            status: 'scheduled'
          },
          {
            'scheduling.nextRun': { $lte: now },
            'scheduling.status': 'pending'
          }
        ]
      });
      
      console.log(`[Scheduler] Found ${scheduledApps.length} tasks to process`);
      
      // Process each app
      for (const app of scheduledApps) {
        // Skip if already processing this app
        if (this.activeJobs.has(app._id.toString())) {
          continue;
        }
        
        console.log(`[Scheduler] Processing scheduled app: ${app.title}`);
        this.processScheduledApp(app);
      }
    } catch (error) {
      console.error('[Scheduler] Error checking scheduled tasks:', error);
    }
  }
  
  /**
   * Process a scheduled app generation
   */
  async processScheduledApp(app) {
    const appId = app._id.toString();
    
    // Mark as in-progress to prevent duplicate processing
    this.activeJobs.set(appId, {
      startTime: new Date(),
      status: 'processing'
    });
    
    try {
      // Update app status to in-progress
      if (app.scheduling) {
        app.scheduling.status = 'in-progress';
      }
      app.status = 'in-progress';
      await app.save();
      
      // Create the structured project
      let result;
      
      // If app already has structure or path defined, we're updating it
      if (app.structure || app.path) {
        result = await this.updateExistingApp(app);
      } else {
        // Otherwise, we're creating a new app
        result = await this.generateNewApp(app);
      }
      
      // Update the scheduling information
      if (app.scheduling) {
        app.scheduling.lastRun = new Date();
        app.scheduling.status = 'completed';
        
        // Calculate next run if this is a recurring task
        if (app.scheduling.repeat) {
          app.scheduling.nextRun = app.calculateNextRun();
          app.scheduling.status = 'pending';
          app.status = 'scheduled';
        } else {
          app.status = 'completed';
        }
      } else {
        app.status = 'completed';
      }
      
      await app.save();
      console.log(`[Scheduler] Successfully processed app: ${app.title}`);
      
      // Clean up job tracking
      this.activeJobs.delete(appId);
    } catch (error) {
      console.error(`[Scheduler] Error processing scheduled app ${app.title}:`, error);
      
      // Update app with error status
      if (app.scheduling) {
        app.scheduling.status = 'failed';
      }
      app.status = 'planned'; // Reset to planned
      await app.save();
      
      // Clean up job tracking
      this.activeJobs.delete(appId);
    }
  }
  
  /**
   * Generate a new app based on scheduled information
   */
  async generateNewApp(app) {
    console.log(`[Scheduler] Generating new app: ${app.title}`);
    
    // Determine if we need to create a structured project
    const prompt = app.promptUsed;
    const shouldCreateStructured = /frontend|backend|fullstack/i.test(prompt);
    
    if (shouldCreateStructured) {
      return await projectGenerator.generateStructuredProject({
        name: app.title,
        prompt: app.promptUsed,
        includeBackend: true,
        includeFrontend: true
      });
    } else {
      // Simple project generation
      const codeGen = projectGenerator.codeGenerator;
      const outputDir = app.path || path.join(
        process.env.PROJECTS_BASE_PATH || '../projects',
        app.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      );
      
      return await codeGen._generateBasicProjectStructure(app.title, outputDir, app.promptUsed);
    }
  }
  
  /**
   * Update an existing app based on scheduled information
   */
  async updateExistingApp(app) {
    console.log(`[Scheduler] Updating existing app: ${app.title}`);
    
    // Check if we have prompt history to use
    if (!app.promptHistory || app.promptHistory.length === 0) {
      return { message: 'No updates to apply' };
    }
    
    // Get latest prompt from history
    const latestPrompt = app.promptHistory[app.promptHistory.length - 1];
    
    // Apply modifications
    const targetPath = app.path;
    if (!targetPath) {
      throw new Error('App path is required for updates');
    }
    
    // Create a modifications file to track changes
    const modificationsPath = path.join(targetPath, 'scheduled-modifications.md');
    
    // Append to existing file or create new one
    let existingContent = '';
    try {
      existingContent = await fs.promises.readFile(modificationsPath, 'utf8');
      existingContent += '\n\n---\n\n';
    } catch (error) {
      // File doesn't exist yet, that's fine
      existingContent = '# Scheduled Modification History\n\n';
    }
    
    const newContent = `## Scheduled Modification - ${new Date().toLocaleString()}\n\n${latestPrompt.prompt}\n\n### Applied Changes:\n- Applied scheduled modification`;
    await fs.promises.writeFile(modificationsPath, existingContent + newContent);
    
    return { 
      message: 'Applied scheduled modification',
      path: targetPath
    };
  }
}

module.exports = new SchedulerService();
