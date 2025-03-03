const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if available, false if not
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // Other errors are considered as "port is available"
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      // If we get here, the port is available
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Find an available port starting from the specified port
 * @param {number} startPort - Port to start checking from
 * @returns {Promise<number>} - First available port
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  const MAX_PORT = 65535;
  const MAX_ATTEMPTS = 100; // Avoid infinite loops
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS && port < MAX_PORT; attempt++, port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  throw new Error(`No available ports found starting from ${startPort}`);
}

/**
 * Get port from environment, CLI arguments, or find an available one
 * @param {number} defaultPort - Default port if none specified
 * @returns {Promise<number>} - Port to use
 */
async function getPort(defaultPort = 3000) {
  // Check CLI args first (--port=XXXX or -p XXXX)
  const args = process.argv.slice(2);
  const portArgIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
  
  if (portArgIndex !== -1 && args[portArgIndex + 1]) {
    const requestedPort = parseInt(args[portArgIndex + 1], 10);
    if (!isNaN(requestedPort)) {
      if (await isPortAvailable(requestedPort)) {
        return requestedPort;
      } else {
        console.warn(`Requested port ${requestedPort} is not available, searching for available port...`);
        return findAvailablePort(requestedPort + 1);
      }
    }
  }
  
  // Check environment variable
  const envPort = parseInt(process.env.PORT, 10);
  if (!isNaN(envPort)) {
    if (await isPortAvailable(envPort)) {
      return envPort;
    } else {
      console.warn(`PORT env variable ${envPort} is not available, searching for available port...`);
      return findAvailablePort(envPort + 1);
    }
  }
  
  // Use default port or find next available
  if (await isPortAvailable(defaultPort)) {
    return defaultPort;
  }
  
  console.warn(`Default port ${defaultPort} is not available, searching for available port...`);
  return findAvailablePort(defaultPort + 1);
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
  getPort
};
