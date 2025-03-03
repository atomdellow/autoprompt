const express = require('express');
const router = express.Router();
const ProjectGenerator = require('../services/projectGenerator');
const Template = require('../models/Template');
const Application = require('../models/Application');
const PromptGenerator = require('../lib/promptGenerator');
const CodeGenerator = require('../lib/codeGenerator');
const path = require('path');
const fs = require('fs').promises;
const VSCodeCopilot = require('../lib/vscodeCopilot');

// Initialize project generator
const projectGenerator = new ProjectGenerator({
  projectsBasePath: process.env.PROJECTS_BASE_PATH || '../projects'
});

// Initialize the code generator
const codeGenerator = new CodeGenerator({
  tempDir: path.join(__dirname, '../tmp'),
  timeout: 120000 // 2 minutes timeout
});

// Create VSCodeCopilot instance
const vscodeCopilot = new VSCodeCopilot();

// Generate a new project
router.post('/generate', async (req, res) => {
  try {
    const { name, templateId, selections, customPrompt, projectPath, connections } = req.body;
    
    if (!name || !templateId) {
      return res.status(400).json({ error: 'Project name and template are required' });
    }
    
    // 1. Get template
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // 2. Generate prompt from template
    const generatedPrompt = PromptGenerator.generate(template, selections, customPrompt);
    
    // 3. Generate project
    const project = await projectGenerator.generateProject({
      name,
      prompt: generatedPrompt,
      template: templateId,
      path: projectPath,
      connectionRefs: connections || []
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate project',
      message: error.message
    });
  }
});

// Fix the generate-from-app route to correctly generate projects and ensure files are created
router.post('/generate-from-app', async (req, res) => {
  try {
    console.log(`Generating app from existing app:`, req.body);
    const { name, sourceAppId, path: customProjectPath, customPrompt } = req.body;
    
    if (!name || !sourceAppId) {
      return res.status(400).json({ error: 'App name and source app ID are required' });
    }
    
    // 1. Get the source app
    const sourceApp = await Application.findById(sourceAppId);
    if (!sourceApp) {
      return res.status(404).json({ error: 'Source app not found' });
    }
    
    // 2. Create prompt from source app
    let prompt = '';
    if (sourceApp.promptUsed) {
      prompt = sourceApp.promptUsed;
      if (customPrompt) {
        prompt += `\n\nAdditional Requirements:\n${customPrompt}`;
      }
    } else {
      // Create a basic prompt from app metadata
      prompt = `Create a ${sourceApp.title} application named "${name}"`;
      if (sourceApp.description) {
        prompt += `\n\nDescription: ${sourceApp.description}`;
      }
      
      if (sourceApp.languages && sourceApp.languages.length) {
        prompt += `\n\nLanguages: ${sourceApp.languages.join(', ')}`;
      }
      
      if (sourceApp.frameworks && sourceApp.frameworks.length) {
        prompt += `\n\nFrameworks: ${sourceApp.frameworks.join(', ')}`;
      }
      
      if (customPrompt) {
        prompt += `\n\nAdditional requirements:\n${customPrompt}`;
      }
    }
    
    // 3. Determine the output directory
    // Get PROJECTS_BASE_PATH from environment variable or use a default path 
    const projectsBasePath = process.env.PROJECTS_BASE_PATH || 
                           path.resolve(__dirname, '../../projects');
    
    // Create sanitized project name
    const sanitizedName = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    // Use custom path or create one in the projects directory
    const outputDir = customProjectPath || path.join(projectsBasePath, sanitizedName);
    
    console.log(`Generating project in: ${outputDir}`);
    console.log(`Using prompt: ${prompt.substring(0, 100)}...`);
    
    // 4. Make sure the target directory exists
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      console.log(`Error creating directory: ${err.message}`);
    }
    
    // 5. Generate the project - force using the fallback method for now
    // until we have proper VS Code integration
    const result = await codeGenerator._generateBasicProjectStructure(name, outputDir, prompt);
    
    // 6. Save the application to the database
    const app = new Application({
      title: name,
      description: `Generated from ${sourceApp.title}`,
      path: outputDir,
      promptUsed: prompt,
      status: 'generated',
      languages: sourceApp.languages || [],
      frameworks: sourceApp.frameworks || []
    });
    
    await app.save();
    
    // 7. Return success
    res.status(201).json({
      id: app._id,
      name,
      path: outputDir,
      createdFiles: result.files || [],
      message: `Project generated successfully in ${outputDir}`
    });
  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate project',
      message: error.message
    });
  }
});

// Debug route to confirm the projects router is loaded
router.get('/debug', (req, res) => {
  res.json({
    status: 'Projects router is working',
    routes: [
      { path: '/generate', method: 'POST', description: 'Generate from template' },
      { path: '/generate-code', method: 'POST', description: 'Generate from prompt' },
      { path: '/generate-from-app', method: 'POST', description: 'Generate from existing app' }
    ]
  });
});

// Add a more explicit handler for the generate-code endpoint with additional logging
router.post('/generate-code', async (req, res) => {
  console.log('🔥 POST /projects/generate-code route hit');
  console.log('Request body:', req.body);
  
  try {
    const { prompt, outputPath, name, projectType } = req.body;
    
    // Validation with detailed error messages
    if (!prompt) {
      console.log('Missing required field: prompt');
      return res.status(400).json({ 
        error: 'Prompt is required',
        details: 'The prompt field must contain the text describing what to generate'
      });
    }
    
    // Set defaults if not provided
    const projectName = name || `project-${Date.now()}`;
    const projectPath = outputPath || path.join(process.env.PROJECTS_BASE_PATH || '../projects', projectName);
    
    console.log(`API Request: Generating code at ${projectPath}`);
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    
    // Ensure output directory exists
    await fs.mkdir(projectPath, { recursive: true });
    
    // Use try-catch for each major step for better error reporting
    let codeGen;
    try {
      codeGen = new CodeGenerator();
    } catch (error) {
      console.error('Failed to initialize CodeGenerator:', error);
      return res.status(500).json({
        error: 'Failed to initialize CodeGenerator',
        details: error.message
      });
    }
    
    let result;
    try {
      console.log('Starting code generation...');
      result = await codeGen._generateBasicProjectStructure(
        projectName, 
        projectPath, 
        prompt
      );
      console.log('Code generation completed:', result.success);
    } catch (error) {
      console.error('Code generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate code',
        details: error.message
      });
    }
    
    let app;
    try {
      // Save to database as a generated app
      app = new Application({
        title: projectName,
        description: `Generated via API from prompt`,
        path: projectPath,
        promptUsed: prompt,
        status: 'generated',
        languages: projectType === 'react' ? ['JavaScript', 'React'] : ['JavaScript'],
        frameworks: projectType === 'api' ? ['Express'] : []
      });
      
      await app.save();
      console.log('Saved new application to database:', app._id);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Failed to save application to database',
        details: error.message,
        note: 'Code was generated but not saved to the database'
      });
    }
    
    // Return success with detailed information
    console.log('Successfully generated project and saved to DB');
    res.status(201).json({
      success: true,
      projectName,
      path: projectPath,
      id: app._id,
      files: result.files,
      message: `Project generated successfully at ${projectPath}`
    });
  } catch (error) {
    console.error('API code generation error:', error);
    res.status(500).json({
      error: 'Failed to generate code',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack.split('\n').slice(0, 3) : undefined
    });
  }
});

// Get project status
router.get('/:id/status', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // You could add additional status info here, like checking if the project is running
    res.json({
      id: app._id,
      name: app.title,
      status: app.status,
      path: app.path,
      lastUpdated: app.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a project
router.post('/:id/start', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const { port } = req.body;
    
    // This will depend on your project structure - modify as needed
    const result = await startProject(app.path, port);
    
    res.json({
      id: app._id,
      name: app.title,
      status: 'running',
      port: result.port,
      pid: result.pid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to start a project
async function startProject(projectPath, requestedPort) {
  const { spawn } = require('child_process');
  const path = require('path');
  
  return new Promise((resolve, reject) => {
    try {
      // Detect project type and choose appropriate start command
      const packageJsonPath = path.join(projectPath, 'package.json');
      const hasPackageJson = require('fs').existsSync(packageJsonPath);
      
      let command, args;
      if (hasPackageJson) {
        // Node.js project
        const packageJson = require(packageJsonPath);
        if (packageJson.scripts && packageJson.scripts.start) {
          command = 'npm';
          args = ['run', 'start'];
        } else {
          command = 'node';
          args = ['index.js']; // assuming index.js is the entry point
        }
      } else {
        // Check for other project types
        reject(new Error('Unsupported project type'));
        return;
      }
      
      // Set port in environment if specified
      const env = { ...process.env };
      if (requestedPort) {
        env.PORT = requestedPort.toString();
      }
      
      // Start the process
      const childProcess = spawn(command, args, {
        cwd: projectPath,
        env,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Capture output to detect port
      let output = '';
      childProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[${childProcess.pid}] ${data.toString().trim()}`);
        
        // Look for port information in the output
        const portMatch = output.match(/listening on (?:port |:)?(\d+)/i);
        if (portMatch) {
          const port = parseInt(portMatch[1], 10);
          resolve({
            pid: childProcess.pid,
            port
          });
        }
      });
      
      // Handle error and timeout
      childProcess.stderr.on('data', (data) => {
        console.error(`[${childProcess.pid}] Error: ${data.toString().trim()}`);
      });
      
      childProcess.on('error', (err) => {
        reject(new Error(`Failed to start process: ${err.message}`));
      });
      
      // Set a timeout to resolve even if we don't detect the port
      setTimeout(() => {
        resolve({
          pid: childProcess.pid,
          port: requestedPort || null,
          warning: 'Could not detect port from output'
        });
      }, 5000);
      
      // Detach the process
      childProcess.unref();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;
