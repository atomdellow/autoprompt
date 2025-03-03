const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get projects path from environment or use default
const projectsPath = process.env.PROJECTS_BASE_PATH || 
                     path.join(process.cwd(), '..', 'projects');

// Create the directory if it doesn't exist
if (!fs.existsSync(projectsPath)) {
  console.log(`Creating projects directory at: ${projectsPath}`);
  fs.mkdirSync(projectsPath, { recursive: true });
  console.log('✅ Projects directory created.');
} else {
  console.log(`✅ Projects directory already exists at: ${projectsPath}`);
}

console.log('\nSetup complete!');
