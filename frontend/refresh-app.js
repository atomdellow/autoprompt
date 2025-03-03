const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

console.log('Starting refresh process...');

// Create a temporary change to router to force recompilation
const routerFilePath = path.join(__dirname, 'src', 'router', 'index.js');
console.log(`Adding temporary comment to ${routerFilePath}`);

try {
  // Add a timestamp comment to force rebuilding of router
  const routerContent = fs.readFileSync(routerFilePath, 'utf8');
  const updatedContent = `// Refreshed at: ${new Date().toISOString()}\n${routerContent}`;
  fs.writeFileSync(routerFilePath, updatedContent);
  
  console.log('Router file updated successfully');
  
  // Clean Vite cache in node_modules
  console.log('Cleaning Vite cache...');
  try {
    const cacheDir = path.join(__dirname, 'node_modules', '.vite');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('Vite cache removed');
    } else {
      console.log('No Vite cache found');
    }
  } catch (err) {
    console.error('Error cleaning Vite cache:', err);
  }
  
  // Restart the development server
  console.log('Restart your development server with:');
  console.log('cd frontend && npm run dev');

} catch (err) {
  console.error('Error updating router file:', err);
}
