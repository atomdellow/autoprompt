const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const CodeGenerator = require('../lib/codeGenerator');

class ProjectGenerator {
  constructor(config = {}) {
    this.config = {
      projectsBasePath: process.env.PROJECTS_BASE_PATH || path.join(process.cwd(), '../projects'),
      tempPath: path.join(process.cwd(), '../temp'),
      copilotEndpoint: process.env.COPILOT_ENDPOINT || 'http://localhost:3001/api/copilot',
      connectionsStore: process.env.CONNECTIONS_STORE || 'http://localhost:3002/api/connections',
      ...config
    };
    
    this.codeGenerator = new CodeGenerator({
      tempDir: this.config.tempPath
    });
  }

  /**
   * Generate a project from a prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Project info
   */
  async generateProject({ 
    name, 
    prompt, 
    template, 
    path: projectPath = null,
    connectionRefs = []
  }) {
    // 1. Prepare destination path
    const projectName = this._sanitizeName(name);
    const destPath = projectPath || path.join(this.config.projectsBasePath, projectName);
    
    console.log(`Generating project "${projectName}" at: ${destPath}`);
    
    try {
      // 2. Generate code using the code generator
      const generationResult = await this.codeGenerator.generate({
        prompt,
        outputDir: destPath,
        name: projectName
      });
      
      console.log(`Code generation completed for ${projectName}`);
      
      // 3. Register connections if provided
      if (connectionRefs.length > 0) {
        await this._registerConnections({
          id: name, // Temporary ID until we register the app
          path: destPath
        }, connectionRefs);
      }
      
      // 4. Register project in app database
      const app = await this._registerApp({
        name: projectName,
        path: destPath,
        prompt,
        template,
        files: generationResult.files || []
      });
      
      return {
        id: app._id,
        name: projectName,
        path: destPath,
        connections: connectionRefs.length,
        createdFiles: generationResult.files || []
      };
    } catch (error) {
      console.error('Project generation failed:', error);
      throw error;
    }
  }

  /**
   * Register the app in the database
   * @private
   */
  async _registerApp(appData) {
    try {
      const response = await axios.post(`http://localhost:3000/api/apps`, {
        title: appData.name,
        description: appData.metadata?.description || `Generated from template: ${appData.template}`,
        path: appData.path,
        prompt: appData.prompt,
        templateUsed: appData.template,
        languages: appData.metadata?.languages || [],
        frameworks: appData.metadata?.frameworks || [],
        status: 'generated'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to register app:', error);
      throw new Error(`App registration failed: ${error.message}`);
    }
  }

  /**
   * Register connections with your connection manager
   * @private
   */
  async _registerConnections(projectInfo, connectionRefs) {
    try {
      const connections = connectionRefs.map(ref => ({
        source: projectInfo.id,
        target: ref.id,
        type: ref.type || 'dependency',
        metadata: ref.metadata || {}
      }));
      
      await axios.post(this.config.connectionsStore, { connections });
    } catch (error) {
      console.error('Failed to register connections:', error);
      // Non-fatal error, continue
    }
  }

  /**
   * Sanitize a project name for file system
   * @private
   */
  _sanitizeName(name) {
    return name.replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Guess the language based on file extension
   * @private
   */
  _guessLanguage(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const langMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.md': 'markdown',
      '.cs': 'csharp'
    };
    
    return langMap[ext] || 'text';
  }
}

module.exports = ProjectGenerator;
