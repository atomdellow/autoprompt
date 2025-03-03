const fs = require('fs'); // Synchronous operations
const fsPromises = require('fs').promises; // Async operations
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

/**
 * CodeGenerator class to handle code generation based on prompts
 * Uses VS Code's GitHub Copilot integration to generate code
 */
class CodeGenerator {
  constructor(options = {}) {
    this.options = {
      tempDir: path.join(os.tmpdir(), 'autoprompt-temp'),
      vscodeExecutable: this._findVSCodeExecutable(),
      timeout: 60000, // 1 minute timeout
      ...options
    };
  }

  /**
   * Generate code from a prompt
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt to generate code from
   * @param {string} params.outputDir - Directory to output generated files
   * @param {string} params.name - Project name
   * @returns {Promise<Object>} Generation results
   */
  async generate({ prompt, outputDir, name }) {
    console.log(`Generating code for ${name} at ${outputDir}`);

    try {
      // Ensure directories exist
      await fsPromises.mkdir(this.options.tempDir, { recursive: true });
      await fsPromises.mkdir(outputDir, { recursive: true });

      // Create the prompt file
      const promptFile = path.join(this.options.tempDir, `${name}-prompt.md`);
      await fsPromises.writeFile(promptFile, prompt, 'utf8');
      console.log(`Prompt saved to ${promptFile}`);

      // Process the prompt using one of our strategies
      const result = await this._processPrompt(promptFile, outputDir, name);
      
      // Return results
      return {
        success: true,
        outputDir,
        name,
        files: result.files,
        message: 'Code generation completed successfully'
      };
    } catch (error) {
      console.error('Code generation error:', error);
      
      // Fallback to simple file generation if integration fails
      if (!this.fallbackAttempted) {
        this.fallbackAttempted = true;
        console.log('Trying fallback code generation...');
        return this._generateBasicProjectStructure(name, outputDir, prompt);
      }
      
      throw error;
    }
  }

  /**
   * Process a prompt using the selected strategy
   * @private
   */
  async _processPrompt(promptFile, outputDir, name) {
    // Try different strategies in order of preference
    const strategies = [
      this._useVSCodeExtension,
      this._useCopilotCLI,
      this._simulateCodeGeneration
    ];

    let lastError = null;
    
    for (const strategy of strategies) {
      try {
        return await strategy.call(this, promptFile, outputDir, name);
      } catch (error) {
        console.log(`Strategy failed: ${error.message}`);
        lastError = error;
      }
    }
    
    throw lastError || new Error('All code generation strategies failed');
  }

  /**
   * Try to use VS Code Extension directly
   * @private
   */
  async _useVSCodeExtension(promptFile, outputDir, name) {
    console.log('Attempting to use VS Code Extension for code generation');
    
    if (!this.options.vscodeExecutable) {
      throw new Error('VS Code executable not found');
    }

    return new Promise((resolve, reject) => {
      // Create an output file to capture results
      const outputFile = path.join(this.options.tempDir, `${name}-result.json`);
      
      // Create a simple workspace for VS Code
      const workspaceDir = path.join(this.options.tempDir, `${name}-workspace`);
      fsPromises.mkdir(workspaceDir, { recursive: true })
        .then(() => {
          // Create a command to run VS Code with the prompt
          const args = [
            '--disable-gpu',
            '--disable-extensions',
            '--extensionDevelopmentPath=./copilot-helper',
            '--user-data-dir=/tmp/vscode-data',
            promptFile
          ];
          
          console.log(`Spawning VS Code: ${this.options.vscodeExecutable} ${args.join(' ')}`);
          
          const process = spawn(this.options.vscodeExecutable, args, {
            detached: true,
            stdio: 'ignore'
          });
          
          // This is where we'd normally handle the response from the VS Code extension
          // But since VS Code extensions don't have a direct CLI API, this is a placeholder
          // In practice, you'd need a custom VS Code extension that handles this request
          
          setTimeout(() => {
            reject(new Error('VS Code extension strategy timed out'));
          }, this.options.timeout);
          
          // In a real impl, the extension would write results to outputFile and we'd read it
        })
        .catch(reject);
    });
  }

  /**
   * Use Copilot CLI if available
   * @private
   */
  async _useCopilotCLI(promptFile, outputDir, name) {
    console.log('Attempting to use Copilot CLI for code generation');
    
    try {
      // Check if the GitHub Copilot CLI is installed
      execSync('gh copilot --version', { stdio: 'ignore' });
      
      // It exists, try using it
      return new Promise((resolve, reject) => {
        // The GitHub Copilot CLI command would look something like:
        // gh copilot suggest -f promptFile -o outputDir
        const process = spawn('gh', ['copilot', 'suggest', '-f', promptFile, '-o', outputDir], {
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let output = '';
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
          console.error(`Copilot CLI error: ${data.toString()}`);
        });
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve({
              files: this._scanGeneratedFiles(outputDir)
            });
          } else {
            reject(new Error(`Copilot CLI exited with code ${code}`));
          }
        });
        
        // Set timeout
        setTimeout(() => {
          process.kill();
          reject(new Error('Copilot CLI strategy timed out'));
        }, this.options.timeout);
      });
    } catch (error) {
      throw new Error('GitHub Copilot CLI not available');
    }
  }

  /**
   * Simulate code generation as a fallback
   * @private
   */
  async _simulateCodeGeneration(promptFile, outputDir, name) {
    console.log('Using simulated code generation');
    
    // Read the prompt
    const promptContent = await fsPromises.readFile(promptFile, 'utf8');
    
    // Parse the prompt to extract key information
    const languages = this._extractFromPrompt(promptContent, /Languages?:?\s*([^.]*)/i) || ['JavaScript'];
    const frameworks = this._extractFromPrompt(promptContent, /Frameworks?:?\s*([^.]*)/i) || ['Express'];
    const databases = this._extractFromPrompt(promptContent, /Databases?:?\s*([^.]*)/i) || [];
    
    // Generate simulated files based on the prompt
    const files = await this._generateBasicProjectStructure(name, outputDir, promptContent);
    
    return {
      files: files.files
    };
  }

  /**
   * Generate a basic project structure as fallback
   * @private
   */
  async _generateBasicProjectStructure(name, outputDir, prompt) {
    console.log('Generating basic project structure as fallback');
    
    try {
      // Parse the prompt
      const isWebApp = /web|website|frontend|UI|react|vue|angular/i.test(prompt);
      const isAPI = /api|backend|server|express|node/i.test(prompt);
      const isFullStack = isWebApp && isAPI;
      const languages = this._extractFromPrompt(prompt, /Languages?:?\s*([^.]*)/i) || ['JavaScript'];
      
      // Get language names as array
      const languageNames = Array.isArray(languages) 
        ? languages 
        : languages.split(/[,;]/).map(l => l.trim());
      
      const isTypeScript = languageNames.some(l => /typescript/i.test(l));
      const fileExt = isTypeScript ? 'ts' : 'js';
      
      // Make directories
      await fsPromises.mkdir(outputDir, { recursive: true });
      
      const files = [];
      
      // Create package.json
      const packageJsonPath = path.join(outputDir, 'package.json');
      const packageJson = {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        description: `Project generated from prompt: ${prompt.slice(0, 100)}...`,
        main: isTypeScript ? 'dist/index.js' : 'index.js',
        scripts: {
          start: isTypeScript ? 'tsc && node dist/index.js' : 'node index.js',
          dev: isTypeScript ? 'ts-node src/index.ts' : 'node index.js',
          build: isTypeScript ? 'tsc' : 'echo "No build step needed"'
        },
        dependencies: {},
        devDependencies: {}
      };
      
      // Add dependencies based on what was detected in the prompt
      if (isAPI) {
        packageJson.dependencies.express = '^4.18.2';
        packageJson.dependencies.cors = '^2.8.5';
        packageJson.dependencies['body-parser'] = '^1.20.1';
      }
      
      if (/database|mongodb|mongo/i.test(prompt)) {
        packageJson.dependencies.mongoose = '^7.0.0';
      }
      
      if (isTypeScript) {
        packageJson.devDependencies.typescript = '^5.0.0';
        packageJson.devDependencies['ts-node'] = '^10.9.1';
        packageJson.devDependencies['@types/node'] = '^18.15.0';
        if (isAPI) {
          packageJson.devDependencies['@types/express'] = '^4.17.17';
          packageJson.devDependencies['@types/cors'] = '^2.8.13';
        }
      }
      
      await fsPromises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      files.push(packageJsonPath);
      
      // Create a basic server
      if (isAPI) {
        const srcDir = path.join(outputDir, isTypeScript ? 'src' : '');
        await fsPromises.mkdir(srcDir, { recursive: true });
        
        const serverFilePath = path.join(srcDir, `index.${fileExt}`);
        const serverCode = isTypeScript ? 
          `import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${name}' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});` :
          `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${name}' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
        
        await fsPromises.writeFile(serverFilePath, serverCode);
        files.push(serverFilePath);
      }
      
      // Create a basic frontend if it's a web app
      if (isWebApp) {
        const publicDir = path.join(outputDir, 'public');
        await fsPromises.mkdir(publicDir, { recursive: true });
        
        const indexHtmlPath = path.join(publicDir, 'index.html');
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>${name}</h1>
    <p>Welcome to your new project!</p>
  </div>
  <script src="app.js"></script>
</body>
</html>`;
        
        await fsPromises.writeFile(indexHtmlPath, htmlContent);
        files.push(indexHtmlPath);
        
        const stylesCssPath = path.join(publicDir, 'styles.css');
        const cssContent = `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  line-height: 1.6;
}

#app {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
}`;
        
        await fsPromises.writeFile(stylesCssPath, cssContent);
        files.push(stylesCssPath);
        
        const appJsPath = path.join(publicDir, `app.${fileExt}`);
        const jsContent = `// Main app script
document.addEventListener('DOMContentLoaded', () => {
  console.log('${name} application loaded');
});`;
        
        await fsPromises.writeFile(appJsPath, jsContent);
        files.push(appJsPath);
      }
      
      // Create README.md
      const readmePath = path.join(outputDir, 'README.md');
      const readmeContent = `# ${name}

Project generated based on the following prompt:

---

${prompt}

---

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
${isTypeScript ? '- TypeScript\n' : ''}

### Installation

1. Clone this repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

### Running the Application

\`\`\`bash
npm start
\`\`\`

${isTypeScript ? 'For development with automatic reloading:\n\n```bash\nnpm run dev\n```\n' : ''}

## Project Structure

\`\`\`
${name}/
${isTypeScript ? '├── src/\n' : ''}${isTypeScript ? '│   └── index.ts\n' : ''}${!isTypeScript ? '├── index.js\n' : ''}${isWebApp ? '├── public/\n' : ''}${isWebApp ? '│   ├── index.html\n' : ''}${isWebApp ? '│   ├── styles.css\n' : ''}${isWebApp ? '│   └── app.js\n' : ''}├── package.json
└── README.md
\`\`\`
`;
      
      await fsPromises.writeFile(readmePath, readmeContent);
      files.push(readmePath);
      
      // Create .gitignore
      const gitignorePath = path.join(outputDir, '.gitignore');
      const gitignoreContent = `node_modules/
.env
${isTypeScript ? 'dist/\n' : ''}npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store`;
      
      await fsPromises.writeFile(gitignorePath, gitignoreContent);
      files.push(gitignorePath);
      
      // If TypeScript, add tsconfig.json
      if (isTypeScript) {
        const tsconfigPath = path.join(outputDir, 'tsconfig.json');
        const tsconfigContent = `{
  "compilerOptions": {
    "target": "es2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`;
        await fsPromises.writeFile(tsconfigPath, tsconfigContent);
        files.push(tsconfigPath);
      }

      return {
        success: true,
        outputDir,
        name,
        files,
        message: 'Generated a basic project structure'
      };
    } catch (error) {
      console.error('Error generating basic project:', error);
      throw error;
    }
  }

  /**
   * Generate a project structure tailored for specific project types
   * @param {string} name - Project name
   * @param {string} outputDir - Output directory
   * @param {string} prompt - The prompt
   * @param {string} projectType - Optional project type for better generation
   */
  async _generateProjectByType(name, outputDir, prompt, projectType = null) {
    // Detect project type if not provided
    if (!projectType) {
      projectType = this._detectProjectType(prompt);
    }
    
    console.log(`Generating ${projectType} project at ${outputDir}`);
    
    // Create base project structure
    const baseProject = await this._generateBasicProjectStructure(name, outputDir, prompt);
    
    // Add project-specific files and structure
    switch(projectType) {
      case 'api':
        await this._enhanceApiProject(outputDir, name);
        break;
      case 'react':
        await this._enhanceReactProject(outputDir, name);
        break;
      // Add more project types as needed
    }
    
    // Scan for all files after enhancements
    const files = await this._scanGeneratedFiles(outputDir);
    
    return {
      success: true,
      outputDir,
      name,
      files,
      message: `Generated a ${projectType} project at ${outputDir}`
    };
  }

  /**
   * Enhance an API project with additional files
   * @private
   */
  async _enhanceApiProject(outputDir, name) {
    // Create additional directories
    const routesDir = path.join(outputDir, 'routes');
    const controllersDir = path.join(outputDir, 'controllers');
    const modelsDir = path.join(outputDir, 'models');
    
    await fsPromises.mkdir(routesDir, { recursive: true });
    await fsPromises.mkdir(controllersDir, { recursive: true });
    await fsPromises.mkdir(modelsDir, { recursive: true });
    
    // Create route files
    const userRoutesPath = path.join(routesDir, 'users.js');
    const userRoutesContent = `const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Public
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Public
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Public
 */
router.post('/', userController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Public
 */
router.put('/:id', userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Public
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;`;

    await fsPromises.writeFile(userRoutesPath, userRoutesContent);
    
    // Create controller files
    const userControllerPath = path.join(controllersDir, 'userController.js');
    const userControllerContent = `// User controller functions

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    // In a real app, you would fetch users from a database
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    // In a real app, you would fetch the user from a database
    const user = { id: userId, name: 'John Doe', email: 'john@example.com' };
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // In a real app, you would save the user to a database
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email
    };
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // In a real app, you would update the user in a database
    const updatedUser = {
      id: userId,
      ...userData
    };
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // In a real app, you would delete the user from a database
    
    res.json({ message: \`User \${userId} deleted successfully\` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};`;

    await fsPromises.writeFile(userControllerPath, userControllerContent);
    
    // Update main index.js file to use the routes
    const indexPath = path.join(outputDir, 'index.js');
    const indexContent = `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${name} API',
    endpoints: [
      { path: '/api/users', methods: ['GET', 'POST'] },
      { path: '/api/users/:id', methods: ['GET', 'PUT', 'DELETE'] }
    ]
  });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`API documentation available at http://localhost:\${PORT}\`);
});`;

    await fsPromises.writeFile(indexPath, indexContent);
  }

  /**
   * @private
   */
  _detectProjectType(prompt) {
    // Simple heuristic to detect project type from prompt
    const promptLower = prompt.toLowerCase();
    
    if (/react|front-?end|ui|website|spa|single page app/i.test(promptLower)) {
      return 'react';
    }
    
    if (/api|backend|server|express|rest|http service/i.test(promptLower)) {
      return 'api';
    }
    
    if (/full.?stack/i.test(promptLower)) {
      return 'fullstack';
    }
    
    return 'generic';
  }

  /**
   * Extract information from the prompt
   * @private
   */
  _extractFromPrompt(prompt, regex) {
    const match = prompt.match(regex);
    if (match && match[1]) {
      return match[1].split(/[,;]/).map(item => item.trim()).filter(Boolean);
    }
    return null;
  }

  /**
   * Find the VS Code executable on the system
   * @private
   */
  _findVSCodeExecutable() {
    try {
      const platform = os.platform();
      
      if (platform === 'win32') {
        // Windows paths to check
        const possiblePaths = [
          'C:\\Program Files\\Microsoft VS Code\\bin\\code.cmd',
          'C:\\Program Files\\Microsoft VS Code\\Code.exe',
          'C:\\Program Files (x86)\\Microsoft VS Code\\bin\\code.cmd',
          'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
          // Add more paths as needed
        ];
        
        for (const codePath of possiblePaths) {
          if (fs.existsSync(codePath)) {
            return codePath;
          }
        }
      } else if (platform === 'darwin') {
        // macOS
        const macPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
        if (fs.existsSync(macPath)) {
          return macPath;
        }
      } else {
        // Linux
        try {
          return execSync('which code').toString().trim();
        } catch (e) {
          return null;
        }
      }
    } catch (error) {
      console.log('Error finding VS Code executable:', error);
      return null;
    }
    
    return null;
  }

  /**
   * Scan directory for generated files
   * @private
   */
  async _scanGeneratedFiles(dir) {
    const results = [];
    
    async function scan(currentDir) {
      const entries = await fsPromises.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const currentPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(currentPath);
        } else {
          results.push(currentPath);
        }
      }
    }
    
    await scan(dir);
    return results;
  }

  /**
   * Use VS Code's Copilot extension for code generation and modification
   * @private
   */
  async _useCopilotExtension(promptFile, outputDir, name, context = {}) {
    console.log('Using VS Code Copilot extension for code generation/modification');

    // Read the prompt
    const promptContent = await fsPromises.readFile(promptFile, 'utf8');

    // Create a workspace context object
    const workspaceContext = {
      projectPath: outputDir,
      errors: context.errors || [],
      testResults: context.testResults || [],
      prompt: promptContent
    };

    try {
      // This would integrate with your VS Code extension
      const vscode = require('vscode');
      
      // Send command to your custom VS Code extension
      const result = await vscode.commands.executeCommand(
        'autoprompt.generateOrModify',
        workspaceContext
      );

      return {
        success: true,
        files: await this._scanGeneratedFiles(outputDir),
        modifications: result.modifications
      };
    } catch (error) {
      console.error('VS Code Copilot extension error:', error);
      throw error;
    }
  }

  /**
   * Modify existing project based on errors or test results
   * @param {Object} options
   * @param {string} options.projectPath - Path to project
   * @param {Array} options.errors - Array of errors
   * @param {Array} options.testResults - Array of test results
   */
  async modifyProject({ projectPath, errors = [], testResults = [] }) {
    const modificationPrompt = this._createModificationPrompt(errors, testResults);
    
    // Create temporary prompt file
    const promptFile = path.join(this.options.tempDir, 'modification-prompt.md');
    await fsPromises.writeFile(promptFile, modificationPrompt);

    return this._useCopilotExtension(promptFile, projectPath, null, {
      errors,
      testResults
    });
  }

  /**
   * Create a prompt for project modification
   * @private
   */
  _createModificationPrompt(errors, testResults) {
    return `
# Project Modification Request

## Current Issues

### Errors
${errors.map(error => `- ${error.message} (in ${error.file}:${error.line})`).join('\n')}

### Test Results
${testResults.map(test => `- ${test.name}: ${test.status}\n  ${test.message || ''}`).join('\n')}

## Requirements
1. Fix all reported errors
2. Ensure all tests pass
3. Maintain existing functionality
4. Follow best practices

Please modify the project code to address these issues while maintaining the original project structure and purpose.
    `;
  }
}

module.exports = CodeGenerator;
