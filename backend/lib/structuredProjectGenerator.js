const fs = require('fs').promises;
const path = require('path');
const { spawn, execSync } = require('child_process');
const CodeGenerator = require('./codeGenerator');

/**
 * Enhanced project generator that creates structured projects with separate 
 * frontend and backend directories
 */
class StructuredProjectGenerator {
  constructor(options = {}) {
    this.codeGenerator = new CodeGenerator(options);
    this.options = {
      tempDir: path.join(require('os').tmpdir(), 'autoprompt-temp'),
      ...options
    };
  }

  /**
   * Generate a structured project with frontend and backend directories
   */
  async generateStructuredProject({ name, prompt, outputDir, includeBackend = true, includeFrontend = true }) {
    const sanitizedName = this._sanitizeName(name);
    const projectPath = outputDir || path.join(process.env.PROJECTS_BASE_PATH, sanitizedName);
    
    console.log(`Generating structured project at ${projectPath}`);
    
    // Create base project directory
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create metadata file in the project root
    await this._createProjectMetadata(projectPath, { name, prompt });
    
    // Determine project type and technologies
    const projectType = this._analyzePrompt(prompt);
    console.log('Detected project type:', projectType);
    
    // Create backend
    let backendPath = null;
    let backendResult = null;
    let backendTech = [];
    
    if (includeBackend) {
      backendPath = path.join(projectPath, 'backend');
      const backendPrompt = this._createBackendPrompt(prompt, projectType);
      backendResult = await this._generateBackend(backendPath, sanitizedName, backendPrompt);
      backendTech = projectType.backendTech || ['Node.js', 'Express'];
    }
    
    // Create frontend
    let frontendPath = null;
    let frontendResult = null;
    let frontendTech = [];
    
    if (includeFrontend) {
      frontendPath = path.join(projectPath, 'frontend');
      const frontendPrompt = this._createFrontendPrompt(prompt, projectType);
      frontendResult = await this._generateFrontend(frontendPath, sanitizedName, frontendPrompt);
      frontendTech = projectType.frontendTech || ['React', 'HTML/CSS'];
    }
    
    // Create top-level README and configuration
    await this._createProjectReadme(projectPath, {
      name: sanitizedName,
      prompt,
      hasFrontend: includeFrontend,
      hasBackend: includeBackend,
      frontendTech,
      backendTech,
      projectType
    });
    
    return {
      success: true,
      path: projectPath,
      name: sanitizedName,
      backendPath,
      frontendPath,
      structure: {
        hasFrontend: includeFrontend,
        hasBackend: includeBackend,
        frontendPath,
        backendPath,
        frontendTech,
        backendTech,
        database: projectType.database
      },
      files: [
        ...(backendResult?.files || []),
        ...(frontendResult?.files || [])
      ]
    };
  }

  /**
   * Generate backend code
   */
  async _generateBackend(backendPath, name, prompt) {
    console.log(`Generating backend at ${backendPath}`);
    
    const result = await this.codeGenerator._generateBasicProjectStructure(
      `${name}-backend`, 
      backendPath, 
      prompt
    );
    
    // Additional backend setup - enhance the backend structure
    const routesDir = path.join(backendPath, 'routes');
    const controllersDir = path.join(backendPath, 'controllers');
    const modelsDir = path.join(backendPath, 'models');
    
    await fs.mkdir(routesDir, { recursive: true });
    await fs.mkdir(controllersDir, { recursive: true });
    await fs.mkdir(modelsDir, { recursive: true });
    
    return result;
  }

  /**
   * Generate frontend code
   */
  async _generateFrontend(frontendPath, name, prompt) {
    console.log(`Generating frontend at ${frontendPath}`);
    
    const result = await this.codeGenerator._generateBasicProjectStructure(
      `${name}-frontend`, 
      frontendPath, 
      prompt
    );
    
    // Additional frontend setup - create a more complete React app
    const srcDir = path.join(frontendPath, 'src');
    const componentsDir = path.join(srcDir, 'components');
    const pagesDir = path.join(srcDir, 'pages');
    
    await fs.mkdir(componentsDir, { recursive: true });
    await fs.mkdir(pagesDir, { recursive: true });
    
    return result;
  }

  /**
   * Analyze prompt to determine project type and requirements
   */
  _analyzePrompt(prompt) {
    const promptLower = prompt.toLowerCase();
    
    const projectType = {
      isFullstack: /full.?stack|both front.{1,3}back|both back.{1,3}front/i.test(promptLower),
      frontendTech: [],
      backendTech: [],
      database: null
    };
    
    // Detect frontend technologies
    if (/react/i.test(promptLower)) projectType.frontendTech.push('React');
    if (/vue/i.test(promptLower)) projectType.frontendTech.push('Vue');
    if (/angular/i.test(promptLower)) projectType.frontendTech.push('Angular');
    if (/next\.?js/i.test(promptLower)) projectType.frontendTech.push('Next.js');
    
    // Detect backend technologies
    if (/express|node\.?js/i.test(promptLower)) projectType.backendTech.push('Express');
    if (/django/i.test(promptLower)) projectType.backendTech.push('Django');
    if (/flask/i.test(promptLower)) projectType.backendTech.push('Flask');
    if (/spring/i.test(promptLower)) projectType.backendTech.push('Spring');
    
    // Detect databases
    if (/mongo/i.test(promptLower)) projectType.database = 'MongoDB';
    if (/postgres/i.test(promptLower)) projectType.database = 'PostgreSQL';
    if (/mysql/i.test(promptLower)) projectType.database = 'MySQL';
    
    // Set defaults if nothing detected
    if (projectType.frontendTech.length === 0) projectType.frontendTech = ['React'];
    if (projectType.backendTech.length === 0) projectType.backendTech = ['Express'];
    
    return projectType;
  }

  /**
   * Create a specialized prompt for backend generation
   */
  _createBackendPrompt(originalPrompt, projectType) {
    const backendPrompt = `Create a backend API with the following requirements:

${originalPrompt}

Please focus on creating a well-structured backend with:
- Clean folder structure (routes, controllers, models)
- RESTful API design
- Input validation
- Error handling
- Database integration${projectType.database ? ` with ${projectType.database}` : ''}
- Environment configuration
- Proper documentation
`;
    return backendPrompt;
  }

  /**
   * Create a specialized prompt for frontend generation
   */
  _createFrontendPrompt(originalPrompt, projectType) {
    const frontendTech = projectType.frontendTech[0] || 'React';
    
    const frontendPrompt = `Create a ${frontendTech} frontend with the following requirements:

${originalPrompt}

Please focus on creating a well-structured frontend with:
- Component-based architecture
- Responsive design
- State management
- Navigation/routing
- Form handling and validation
- API integration with the backend
- Clean UI/UX design
`;
    return frontendPrompt;
  }

  /**
   * Create project metadata file
   */
  async _createProjectMetadata(projectPath, { name, prompt }) {
    const metadataPath = path.join(projectPath, '.project-metadata.json');
    const metadata = {
      name,
      description: prompt.slice(0, 200) + (prompt.length > 200 ? '...' : ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedWith: 'AutoPrompt'
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Create project README with setup instructions
   */
  async _createProjectReadme(projectPath, projectInfo) {
    const readmePath = path.join(projectPath, 'README.md');
    
    let backendInstructions = '';
    if (projectInfo.hasBackend) {
      backendInstructions = `
## Backend

The backend is built using ${projectInfo.backendTech.join(', ')}.

### Setup and Running

\`\`\`bash
cd backend
npm install
npm start
\`\`\`

The API will be available at http://localhost:3000.
`;
    }
    
    let frontendInstructions = '';
    if (projectInfo.hasFrontend) {
      frontendInstructions = `
## Frontend

The frontend is built using ${projectInfo.frontendTech.join(', ')}.

### Setup and Running

\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

The application will be available at http://localhost:5173.
`;
    }
    
    const readmeContent = `# ${projectInfo.name}

This project was generated by AutoPrompt.

## Project Overview

${projectInfo.prompt.slice(0, 500)}${projectInfo.prompt.length > 500 ? '...' : ''}

## Project Structure

\`\`\`
${projectInfo.name}/
${projectInfo.hasBackend ? '├── backend/\n' : ''}${projectInfo.hasFrontend ? '├── frontend/\n' : ''}├── README.md
└── .project-metadata.json
\`\`\`

${backendInstructions}

${frontendInstructions}

## Development

To work on the entire application, you'll need to run both the frontend and backend:

1. Start the backend server
2. In a separate terminal, start the frontend development server
3. Make your changes

## Modifying This Project

You can extend this project by:

1. Adding new features through the AutoPrompt interface
2. Manually editing the code
3. Installing additional packages as needed

Generated on: ${new Date().toLocaleString()}
`;
    
    await fs.writeFile(readmePath, readmeContent);
  }

  /**
   * Sanitize a project name for file system
   */
  _sanitizeName(name) {
    return name.replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}

module.exports = StructuredProjectGenerator;
