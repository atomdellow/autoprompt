const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { spawn, execSync } = require('child_process');
const StructuredProjectGenerator = require('../lib/structuredProjectGenerator');
const { parse } = require('csv-parse/sync'); // Update import
const schedulerService = require('../services/schedulerService');

// Setup structured project generator
const projectGenerator = new StructuredProjectGenerator();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  }
});

// Get all applications with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { path: searchRegex },
          { languages: searchRegex },
          { frameworks: searchRegex }
        ]
      };
    }

    // Parse sort parameter
    let sortOptions = { createdAt: -1 };
    if (sort) {
      try {
        const parsedSort = JSON.parse(sort);
        if (parsedSort.field) {
          sortOptions = {
            [parsedSort.field]: parsedSort.order === 'asc' ? 1 : -1
          };
        }
      } catch (err) {
        console.warn('Invalid sort parameter:', sort);
      }
    }

    // Get filtered results
    const [apps, total] = await Promise.all([
      Application
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query)
    ]);

    console.log(`Found ${total} matches for search: "${search || 'none'}"`);

    res.json({
      apps,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        isFiltered: Boolean(search?.trim())
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new application
router.post('/', async (req, res) => {
  try {
    const app = new Application(req.body);
    await app.save();
    res.status(201).json(app);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Batch import applications from CSV/JSON
router.post('/batch', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const apps = [];
    if (req.file.mimetype === 'text/csv') {
      // Process CSV using sync parser
      const records = parse(req.file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      // Convert string arrays to actual arrays
      records.forEach(record => {
        if (record.languages) record.languages = record.languages.split(',').map(s => s.trim());
        if (record.frameworks) record.frameworks = record.frameworks.split(',').map(s => s.trim());
      });
      
      apps.push(...records);
    } else if (req.file.mimetype === 'application/json') {
      apps.push(...JSON.parse(req.file.buffer.toString()));
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const savedApps = await Application.insertMany(apps);
    res.status(201).json(savedApps);
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(400).json({ 
      error: 'Failed to process file: ' + error.message,
      details: error.stack
    });
  }
});

// Update application status
router.patch('/:id/status', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(app);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit application
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle date formatting
    if (updateData.scheduled) {
      updateData.scheduled = new Date(updateData.scheduled);
    }
    
    updateData.updatedAt = new Date();

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(app);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Schedule deletion
router.delete('/:id', async (req, res) => {
  try {
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 7); // 7 days from now

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        deletionScheduled: {
          date: deleteDate,
          reason: req.body.reason
        }
      },
      { new: true }
    );
    res.json(app);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel deletion
router.post('/:id/restore', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        $unset: { deletionScheduled: "" }
      },
      { new: true }
    );
    res.json(app);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add route to get app relationships
router.get('/:id/relationships', async (req, res) => {
  try {
    const appId = req.params.id;
    
    // Fetch the app to check if it exists
    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Fetch relationships if you have a connections collection
    // This is just a placeholder - modify to match your database schema
    const relationships = []; 
    
    try {
      // Attempt to get connections from your connection store
      const connectionsResponse = await axios.get(
        `${process.env.CONNECTIONS_STORE}/connections?appId=${appId}`
      );
      
      if (connectionsResponse.data && Array.isArray(connectionsResponse.data)) {
        relationships.push(...connectionsResponse.data);
      }
    } catch (error) {
      console.warn('Failed to fetch connections:', error.message);
      // Non-fatal error, continue with empty relationships
    }
    
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching app relationships:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get detailed information about an app
 */
router.get('/:id', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get prompt history for an app
 */
router.get('/:id/history', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({
      originalPrompt: app.promptUsed,
      history: app.promptHistory || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Modify an existing app with a new prompt
 */
router.post('/:id/modify', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Make modifications based on the prompt and the app structure
    let changes = [];
    
    // Determine if we're modifying backend, frontend or both
    const targetBackend = req.body.target === 'backend' || !req.body.target;
    const targetFrontend = req.body.target === 'frontend' || !req.body.target;
    
    // Apply modifications to the app
    if (app.structure?.hasBackend && targetBackend) {
      const backendChanges = await applyModifications(app.structure.backendPath, prompt, 'backend');
      changes = [...changes, ...backendChanges.map(c => `Backend: ${c}`)];
    }
    
    if (app.structure?.hasFrontend && targetFrontend) {
      const frontendChanges = await applyModifications(app.structure.frontendPath, prompt, 'frontend');
      changes = [...changes, ...frontendChanges.map(c => `Frontend: ${c}`)];
    }
    
    // If no structure defined, modify the main directory
    if (!app.structure?.hasBackend && !app.structure?.hasFrontend) {
      const mainChanges = await applyModifications(app.path, prompt, 'fullstack');
      changes = [...changes, ...mainChanges];
    }
    
    // Update app with the new prompt in history
    await app.addPromptToHistory(prompt, changes);
    
    // Return success response
    res.json({
      message: 'Application modified successfully',
      changes: changes,
      app: {
        id: app._id,
        title: app.title,
        lastModified: app.lastModified
      }
    });
  } catch (error) {
    console.error('Failed to modify app:', error);
    res.status(500).json({ 
      error: 'Failed to modify application',
      message: error.message
    });
  }
});

/**
 * Install a package to an app
 */
router.post('/:id/install', async (req, res) => {
  try {
    const { package, version, target } = req.body;
    
    if (!package) {
      return res.status(400).json({ error: 'Package name is required' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Determine install path based on target
    let installPath;
    
    if (target === 'frontend' && app.structure?.frontendPath) {
      installPath = app.structure.frontendPath;
    } else if (target === 'backend' && app.structure?.backendPath) {
      installPath = app.structure.backendPath;
    } else {
      // Default to the main path if no structure defined or no target specified
      installPath = app.path;
    }
    
    // Check if package.json exists
    const packageJsonPath = path.join(installPath, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch (error) {
      return res.status(400).json({ 
        error: 'No package.json found in target directory',
        message: `Could not find a package.json file in ${installPath}`
      });
    }
    
    // Install the package
    const installResult = await installPackage(installPath, package, version);
    
    // Update app with installed package
    await app.installPackage(package, version || 'latest', target);
    
    res.json({
      message: `Package ${package} installed successfully`,
      details: installResult,
      app: {
        id: app._id,
        title: app.title,
        lastModified: app.lastModified
      }
    });
  } catch (error) {
    console.error('Failed to install package:', error);
    res.status(500).json({
      error: 'Failed to install package',
      message: error.message
    });
  }
});

/**
 * Create a structured app
 */
router.post('/create-structured', async (req, res) => {
  try {
    const { name, prompt, includeBackend = true, includeFrontend = true } = req.body;
    
    if (!name || !prompt) {
      return res.status(400).json({ error: 'Name and prompt are required' });
    }
    
    // Generate the structured project
    const outputDir = path.join(
      process.env.PROJECTS_BASE_PATH || '../projects',
      name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    );
    
    const result = await projectGenerator.generateStructuredProject({
      name,
      prompt,
      outputDir,
      includeBackend,
      includeFrontend
    });
    
    // Create app record in database
    const app = new Application({
      title: name,
      description: `Structured project generated from prompt`,
      path: result.path,
      promptUsed: prompt,
      status: 'generated',
      structure: result.structure,
      languages: detectLanguages(prompt),
      frameworks: detectFrameworks(prompt)
    });
    
    await app.save();
    
    res.status(201).json({
      id: app._id,
      name,
      path: result.path,
      structure: app.structure,
      message: `Structured project generated at ${result.path}`
    });
  } catch (error) {
    console.error('Failed to create structured project:', error);
    res.status(500).json({
      error: 'Failed to create structured project',
      message: error.message
    });
  }
});

/**
 * Schedule an app with precise date and time
 */
router.post('/:id/schedule', async (req, res) => {
  try {
    const { dateTime, priority, repeat, repeatFrequency, repeatInterval } = req.body;
    
    if (!dateTime) {
      return res.status(400).json({ error: 'Scheduled dateTime is required' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Extract time components for the enhanced scheduling
    const scheduledDate = new Date(dateTime);
    const timeString = `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`;
    const dateString = scheduledDate.toISOString().split('T')[0];
    
    // Use the new scheduleWithTime method for better time precision
    await app.scheduleWithTime(dateString, timeString, {
      priority,
      repeat,
      repeatFrequency,
      repeatInterval,
      timeZone: 'local' // You could pass this from the frontend if needed
    });
    
    // If the scheduler isn't running, start it
    if (schedulerService && typeof schedulerService.start === 'function' && !schedulerService.isRunning) {
      schedulerService.start();
    }
    
    res.json({
      message: `App ${app.title} scheduled for ${new Date(dateTime).toLocaleString()}`,
      scheduledDateTime: app.scheduling.scheduledDateTime,
      nextRun: app.scheduling.nextRun,
      status: app.scheduling.status
    });
  } catch (error) {
    console.error('Failed to schedule app:', error);
    res.status(500).json({ 
      error: 'Failed to schedule application',
      message: error.message
    });
  }
});

/**
 * Cancel a scheduled app
 */
router.post('/:id/cancel-schedule', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Cancel scheduling
    if (app.scheduling) {
      app.scheduling.status = 'cancelled';
    }
    app.status = app.status === 'scheduled' ? 'planned' : app.status;
    app.scheduled = null;
    
    await app.save();
    
    res.json({
      message: `Schedule cancelled for app ${app.title}`,
      status: app.status
    });
  } catch (error) {
    console.error('Failed to cancel schedule:', error);
    res.status(500).json({ 
      error: 'Failed to cancel schedule',
      message: error.message
    });
  }
});

/**
 * Schedule an app for creation or updating
 */
router.post('/:id/schedule', async (req, res) => {
  try {
    const { dateTime, priority, repeat, repeatFrequency, repeatInterval } = req.body;
    
    if (!dateTime) {
      return res.status(400).json({ error: 'Scheduled dateTime is required' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Schedule the app
    await app.schedule({
      dateTime,
      priority,
      repeat,
      repeatFrequency,
      repeatInterval
    });
    
    // If the scheduler isn't running, start it
    if (!schedulerService.isRunning) {
      schedulerService.start();
    }
    
    res.json({
      message: `App ${app.title} scheduled for ${new Date(dateTime).toLocaleString()}`,
      scheduledDateTime: app.scheduling.scheduledDateTime,
      nextRun: app.scheduling.nextRun,
      status: app.scheduling.status
    });
  } catch (error) {
    console.error('Failed to schedule app:', error);
    res.status(500).json({ 
      error: 'Failed to schedule application',
      message: error.message
    });
  }
});

/**
 * Cancel a scheduled app
 */
router.post('/:id/cancel-schedule', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Cancel scheduling
    if (app.scheduling) {
      app.scheduling.status = 'cancelled';
    }
    app.status = 'planned';
    app.scheduled = null;
    
    await app.save();
    
    res.json({
      message: `Schedule cancelled for app ${app.title}`,
      status: app.status
    });
  } catch (error) {
    console.error('Failed to cancel schedule:', error);
    res.status(500).json({ 
      error: 'Failed to cancel schedule',
      message: error.message
    });
  }
});

/**
 * POST /api/apps/:id/create-now
 * Immediately create an app that was scheduled for later
 */
router.post('/:id/create-now', async (req, res) => {
  try {
    const appId = req.params.id;
    
    // Find the app - Fix the model reference
    const Application = require('../models/Application');
    const app = await Application.findById(appId);
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    if (!app.scheduled && !app.scheduling?.scheduledDateTime) {
      return res.status(400).json({ error: 'This app is not scheduled for creation' });
    }
    
    // Get the app service
    const appService = require('../services/appService');
    
    // Start the app creation process
    const createResult = await appService.createApp(app);
    
    // Update the app to mark it as no longer scheduled
    app.scheduled = null;
    
    // Update the scheduling information if it exists
    if (app.scheduling) {
      app.scheduling.status = 'completed';
    }
    
    app.status = 'in-progress'; // Update status to reflect it's being created
    app.updatedAt = new Date();
    await app.save();
    
    res.json({ 
      message: 'App creation started', 
      app: app,
      result: createResult
    });
    
  } catch (err) {
    console.error('Error creating app now:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Helper functions
function detectLanguages(prompt) {
  const languages = [];
  const promptLower = prompt.toLowerCase();
  
  if (/javascript|js|node/i.test(promptLower)) languages.push('JavaScript');
  if (/typescript|ts/i.test(promptLower)) languages.push('TypeScript');
  if (/python|django|flask/i.test(promptLower)) languages.push('Python');
  if (/java|spring/i.test(promptLower)) languages.push('Java');
  if (/c#|\.net|dotnet/i.test(promptLower)) languages.push('C#');
  if (/php|laravel/i.test(promptLower)) languages.push('PHP');
  
  return languages.length ? languages : ['JavaScript'];
}

function detectFrameworks(prompt) {
  const frameworks = [];
  const promptLower = prompt.toLowerCase();
  
  if (/react/i.test(promptLower)) frameworks.push('React');
  if (/vue/i.test(promptLower)) frameworks.push('Vue');
  if (/angular/i.test(promptLower)) frameworks.push('Angular');
  if (/express/i.test(promptLower)) frameworks.push('Express');
  if (/django/i.test(promptLower)) frameworks.push('Django');
  if (/flask/i.test(promptLower)) frameworks.push('Flask');
  if (/spring/i.test(promptLower)) frameworks.push('Spring');
  if (/laravel/i.test(promptLower)) frameworks.push('Laravel');
  
  return frameworks;
}

async function applyModifications(targetPath, prompt, type) {
  // This would normally use Copilot or other AI tools to make changes
  // For now, we'll just create a modifications.md file with the requested changes
  const modificationsPath = path.join(targetPath, 'modifications.md');
  
  let existingContent = '';
  try {
    existingContent = await fs.readFile(modificationsPath, 'utf8');
    existingContent += '\n\n---\n\n';
  } catch (error) {
    // File doesn't exist yet, that's fine
    existingContent = '# Modification History\n\n';
  }
  
  const newContent = `## Modification - ${new Date().toLocaleString()}\n\n${prompt}\n\n### Applied Changes:\n- Added this modification record`;
  await fs.writeFile(modificationsPath, existingContent + newContent);
  
  return ['Created modification record'];
}

async function installPackage(projectPath, packageName, version) {
  return new Promise((resolve, reject) => {
    const versionArg = version ? `@${version}` : '';
    const fullPackage = `${packageName}${versionArg}`;
    
    const npm = spawn('npm', ['install', fullPackage], {
      cwd: projectPath,
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    npm.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    npm.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          message: `Successfully installed ${fullPackage}`,
          output
        });
      } else {
        reject(new Error(`Failed to install package: ${errorOutput || 'Unknown error'}`));
      }
    });
  });
}

module.exports = router;
