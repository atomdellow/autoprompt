const fs = require('fs'); // Synchronous operations
const fsPromises = require('fs').promises; // Async operations
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

/**
 * Class to integrate directly with VS Code Copilot
 */
class VSCodeCopilot {
  constructor(options = {}) {
    this.options = {
      vscodePath: this._findVSCodePath(),
      workspaceDir: path.join(os.tmpdir(), 'autoprompt-workspace'),
      timeout: 60000, // 1 minute timeout
      ...options
    };
    
    console.log(`VS Code Path: ${this.options.vscodePath}`);
  }
  
  /**
   * Generate code from a prompt using VS Code and GitHub Copilot
   */
  async generateProject(prompt, outputDir) {
    console.log(`Generating code in ${outputDir} from prompt: ${prompt.substring(0, 50)}...`);
    
    try {
      // 1. Create a temporary workspace with the prompt
      await this._setupWorkspace(prompt);
      
      // 2. Generate code from the prompt
      const result = await this._executeCodeGeneration();
      
      // 3. Move generated files to output directory
      await this._moveGeneratedFiles(outputDir);
      
      return {
        success: true,
        files: result.files || []
      };
    } catch (error) {
      console.error('VS Code Copilot code generation failed:', error);
      
      // Fallback to manual project generation
      return await this._fallbackGeneration(prompt, outputDir);
    }
  }
  
  /**
   * Set up a workspace with the prompt
   * @private
   */
  async _setupWorkspace(prompt) {
    // Ensure workspace directory exists
    await fsPromises.mkdir(this.options.workspaceDir, { recursive: true });
    
    // Create prompt file
    const promptFilePath = path.join(this.options.workspaceDir, 'prompt.md');
    await fsPromises.writeFile(promptFilePath, prompt);
    
    // Create a basic VS Code workspace file
    const workspaceFilePath = path.join(this.options.workspaceDir, 'workspace.code-workspace');
    const workspaceConfig = {
      folders: [{ path: '.' }],
      settings: {
        "editor.inlineSuggest.enabled": true,
        "github.copilot.enable": {
          "*": true
        }
      }
    };
    
    await fsPromises.writeFile(workspaceFilePath, JSON.stringify(workspaceConfig, null, 2));
    
    return {
      promptFilePath,
      workspaceFilePath
    };
  }
  
  /**
   * Execute code generation using VS Code and Copilot
   * @private
   */
  async _executeCodeGeneration() {
    return new Promise((resolve, reject) => {
      // Here, we'll need to spawn VS Code with command line parameters
      // This is a simplified version - the actual implementation would need
      // a custom VS Code extension that accepts the prompt and generates files
      
      // For demo purposes, we're just showing the command that would be used
      console.log(`Would execute: "${this.options.vscodePath}" --folder-uri ${this.options.workspaceDir}`);
      
      // This is where you'd actually run VS Code with the GitHub Copilot extension
      // Since VS Code doesn't have a direct command line interface for this,
      // let's simulate the generation
      
      setTimeout(() => {
        // In a real implementation, this would wait for the VS Code process to finish
        // and collect the generated files
        resolve({
          success: true,
          files: []
        });
      }, 2000);
    });
  }
  
  /**
   * Move generated files to the output directory
   * @private
   */
  async _moveGeneratedFiles(outputDir) {
    await fsPromises.mkdir(outputDir, { recursive: true });
    
    // In a real implementation, this would move all generated files from
    // the workspace to the output directory
    
    console.log(`Moving generated files to ${outputDir}`);
    return true;
  }
  
  /**
   * Find the VS Code executable path
   * @private
   */
  _findVSCodePath() {
    try {
      const platform = os.platform();
      
      if (platform === 'win32') {
        // Check common VS Code installation paths on Windows
        const commonPaths = [
          'C:\\Program Files\\Microsoft VS Code\\Code.exe',
          'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
          'C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'
        ];
        
        for (const codePath of commonPaths) {
          if (fs.existsSync(codePath)) {
            return codePath;
          }
        }
        
        // Try to find VS Code in PATH
        try {
          return execSync('where code').toString().trim().split('\n')[0];
        } catch (e) {
          console.log('VS Code not found in PATH');
        }
      } else if (platform === 'darwin') {
        return '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
      } else {
        // Linux
        try {
          return execSync('which code').toString().trim();
        } catch (e) {
          console.log('VS Code not found in PATH');
        }
      }
    } catch (error) {
      console.error('Error finding VS Code path:', error);
    }
    
    console.warn('VS Code path not found. Using fallback code generation.');
    return null;
  }
  
  /**
   * Fallback generation when VS Code integration fails
   * @private
   */
  async _fallbackGeneration(prompt, outputDir) {
    console.log('Using fallback code generation');
    
    // Create directory if it doesn't exist
    await fsPromises.mkdir(outputDir, { recursive: true });
    
    // Extract project type from prompt
    const isNodeJS = /node|javascript|express|api/i.test(prompt);
    const isReact = /react|frontend|ui/i.test(prompt);
    
    // Create basic files based on project type
    const files = [];
    
    // Create package.json
    const packageJsonPath = path.join(outputDir, 'package.json');
    const packageJson = {
      name: path.basename(outputDir),
      version: '1.0.0',
      description: 'Generated project from prompt',
      main: 'index.js',
      scripts: {
        start: 'node index.js'
      },
      dependencies: {}
    };
    
    if (isNodeJS) {
      packageJson.dependencies.express = '^4.18.2';
      packageJson.dependencies.cors = '^2.8.5';
    }
    
    if (isReact) {
      packageJson.dependencies.react = '^18.2.0';
      packageJson.dependencies['react-dom'] = '^18.2.0';
      packageJson.scripts.start = 'react-scripts start';
      packageJson.scripts.build = 'react-scripts build';
      packageJson.dependencies['react-scripts'] = '5.0.1';
    }
    
    await fsPromises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    files.push(packageJsonPath);
    
    // Create basic server file if it's a Node.js project
    if (isNodeJS) {
      const serverFilePath = path.join(outputDir, 'index.js');
      const serverCode = `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
      await fsPromises.writeFile(serverFilePath, serverCode);
      files.push(serverFilePath);
    }
    
    // Create React files if it's a React project
    if (isReact) {
      const srcDir = path.join(outputDir, 'src');
      await fsPromises.mkdir(srcDir, { recursive: true });
      
      const indexJsPath = path.join(srcDir, 'index.js');
      const indexJsCode = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
      await fsPromises.writeFile(indexJsPath, indexJsCode);
      files.push(indexJsPath);
      
      const appJsPath = path.join(srcDir, 'App.js');
      const appJsCode = `import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My App</h1>
        <p>This is a basic React application.</p>
      </header>
    </div>
  );
}

export default App;
`;
      await fsPromises.writeFile(appJsPath, appJsCode);
      files.push(appJsPath);
    }
    
    // Create README.md
    const readmePath = path.join(outputDir, 'README.md');
    const readmeContent = `# ${path.basename(outputDir)}

Generated project based on the prompt:

\`\`\`
${prompt}
\`\`\`

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Run the application:
   \`\`\`
   npm start
   \`\`\`
`;
    await fsPromises.writeFile(readmePath, readmeContent);
    files.push(readmePath);
    
    return {
      success: true,
      files
    };
  }
}

module.exports = VSCodeCopilot;
