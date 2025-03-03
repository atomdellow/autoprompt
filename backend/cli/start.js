#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    description: 'Port to start the server on',
    type: 'number'
  })
  .option('detached', {
    alias: 'd',
    description: 'Run the server in detached mode',
    type: 'boolean',
    default: false
  })
  .option('log', {
    alias: 'l',
    description: 'Log file path',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Resolve server.js path
const serverPath = path.resolve(__dirname, '../server.js');

// Start server
function startServer() {
  // Prepare environment
  const env = { ...process.env };
  if (argv.port) {
    env.PORT = argv.port.toString();
  }

  // Spawn options
  const options = {
    env,
    stdio: argv.detached ? 'ignore' : 'inherit'
  };

  if (argv.detached) {
    options.detached = true;
  }
  
  // Handle logging
  if (argv.log && argv.detached) {
    const logStream = fs.openSync(argv.log, 'a');
    options.stdio = ['ignore', logStream, logStream];
  }

  // Start the server
  const server = spawn('node', [serverPath], options);

  if (argv.detached) {
    // Capture port information
    let output = '';
    
    if (!argv.log) {
      // Set up output capture if no log file specified
      server.stdout.on('data', (data) => {
        output += data.toString();
        const match = output.match(/PORT=(\d+)/);
        if (match) {
          console.log(`Server started on port ${match[1]}`);
          process.exit(0);
        }
      });
    }
    
    server.unref();
    
    // Give it some time to start and report port
    setTimeout(() => {
      console.log('Server started in detached mode');
      process.exit(0);
    }, 2000);
  }
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  return server;
}

startServer();
