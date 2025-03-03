const path = require('path');
const fs = require('fs').promises;

/**
 * Service to handle app creation
 */
class AppService {
  /**
   * Create an app from template or prompt
   * @param {Object} app - The app document or app data
   * @returns {Promise<Object>} Created app information
   */
  async createApp(app) {
    try {
      console.log('Starting app creation for:', app.title);
      
      // Determine the base path where apps should be created
      const baseProjectPath = process.env.PROJECTS_BASE_PATH || path.join(process.cwd(), 'projects');
      
      // Create folder for the app if it doesn't already exist
      const appPath = app.path || path.join(baseProjectPath, this.sanitizeName(app.title));
      await this.ensureDirectoryExists(appPath);
      
      // Logic to generate app based on template or prompt
      if (app.templateId) {
        // If app has a template ID, generate from template
        await this.generateFromTemplate(app, appPath);
      } else if (app.promptId || app.promptContent) {
        // If app has prompt info, generate from prompt
        await this.generateFromPrompt(app, appPath);
      } else {
        // Create a simple app structure as fallback
        await this.createBasicAppStructure(app, appPath);
      }
      
      // Update app with creation info
      if (app._id) {  // Only update if it's an existing app document
        // Use the model directly to avoid issues with mongoose document instantiation
        const Application = require('../models/Application');
        await Application.findByIdAndUpdate(app._id, {
          status: 'completed',
          path: appPath,
          updatedAt: new Date()
        });
      }
      
      return { 
        title: app.title, 
        path: appPath, 
        status: 'completed' 
      };
    } catch (error) {
      console.error('Error creating app:', error);
      
      // Update app with error status
      if (app._id) {
        const Application = require('../models/Application');
        await Application.findByIdAndUpdate(app._id, {
          status: 'error',
          errorMessage: error.message,
          updatedAt: new Date()
        });
      }
      
      throw error;
    }
  }
  
  // Helper to generate app from template
  async generateFromTemplate(app, appPath) {
    // Find the associated template
    const Template = require('../models/Template');
    const template = await Template.findById(app.templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Here you'd integrate with your template generation logic
    console.log(`Generating app from template "${template.name}" at ${appPath}`);
    
    // Simple file creation as placeholder
    await fs.writeFile(
      path.join(appPath, 'README.md'), 
      `# ${app.title}\n\nCreated from template: ${template.name}\n\n${app.description || ''}`
    );
    
    // Create package.json
    await fs.writeFile(
      path.join(appPath, 'package.json'),
      JSON.stringify({
        name: this.sanitizeName(app.title),
        version: '1.0.0',
        description: app.description,
        main: 'index.js',
        scripts: {
          start: 'node index.js'
        }
      }, null, 2)
    );
  }
  
  // Helper to generate app from prompt
  async generateFromPrompt(app, appPath) {
    let promptContent = app.promptContent;
    
    // If we have a prompt ID but no content, fetch the prompt
    if (app.promptId && !promptContent) {
      const Prompt = require('../models/Prompt');
      const prompt = await Prompt.findById(app.promptId);
      if (!prompt) {
        throw new Error('Prompt not found');
      }
      promptContent = prompt.content;
    }
    
    if (!promptContent) {
      throw new Error('No prompt content available');
    }
    
    // Here you'd integrate with your AI model to generate code from prompt
    console.log(`Generating app from prompt at ${appPath}`);
    
    // Simple file creation as placeholder
    await fs.writeFile(
      path.join(appPath, 'README.md'), 
      `# ${app.title}\n\nCreated from prompt\n\n${app.description || ''}\n\n## Prompt used:\n\n${promptContent}`
    );
    
    // Create a basic index.js file
    await fs.writeFile(
      path.join(appPath, 'index.js'),
      `// Generated app: ${app.title}\nconsole.log('App generated from prompt');\n`
    );
  }
  
  // Create a very basic app structure as fallback
  async createBasicAppStructure(app, appPath) {
    console.log(`Creating basic app structure at ${appPath}`);
    
    // Create README.md
    await fs.writeFile(
      path.join(appPath, 'README.md'),
      `# ${app.title}\n\n${app.description || 'No description provided.'}`
    );
    
    // Create index.js
    await fs.writeFile(
      path.join(appPath, 'index.js'),
      `console.log('App: ${app.title}');\n`
    );
    
    // Create package.json
    await fs.writeFile(
      path.join(appPath, 'package.json'),
      JSON.stringify({
        name: this.sanitizeName(app.title),
        version: '0.1.0',
        description: app.description,
        main: 'index.js'
      }, null, 2)
    );
  }
  
  // Helper to sanitize app name for filesystem
  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
  }
  
  // Helper to ensure a directory exists
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
}

module.exports = new AppService();
