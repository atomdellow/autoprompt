require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { getPort } = require('./utils/portManager');
const schedulerService = require('./services/schedulerService');

// Import routes
const apiRoutes = require('./routes/api');
const appsRoutes = require('./routes/apps');
const templatesRoutes = require('./routes/templates');
const projectsRoutes = require('./routes/projects');
const promptsRoutes = require('./routes/prompts'); // Add this line

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // Increased limit for larger requests
app.use(express.urlencoded({ extended: true }));

// Set up CORS to allow requests from frontend domain
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Detailed request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request body for debugging (except file uploads which are too large)
  if (req.method !== 'GET' && !req.url.includes('/upload') && req.body) {
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200) + '...');
  }
  
  // Log response time when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// API Routes - make sure this order is correct
app.use('/api', apiRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/projects', projectsRoutes);  // This route must be properly registered
app.use('/api/prompts', promptsRoutes); // Add this line

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// Debug endpoint to list all routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods);
          routes.push({ path: middleware.regexp.toString() + path, methods });
        }
      });
    }
  });
  res.json({ routes });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack.split('\n').slice(0, 3).join('\n'),
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack.split('\n').slice(0, 3) : undefined
  });
});

// Catch-all handler for undefined routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource was not found: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Start the server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autoprompt');
    console.log('Connected to MongoDB');
    
    // Start the scheduler service after database connection is established
    schedulerService.start();
    
    // Get available port
    const port = await getPort(process.env.PORT || 3000);
    
    // Start server
    const server = app.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`Server running on http://localhost:${actualPort}`);
      console.log('Available API endpoints:');
      console.log(' - GET    /health');
      console.log(' - GET    /api/routes (debug)');
      console.log(' - GET    /api/apps');
      console.log(' - POST   /api/apps');
      console.log(' - GET    /api/templates');
      console.log(' - POST   /api/projects/generate-code');
      
      // Write port to stdout for parent processes to capture
      process.stdout.write(`PORT=${actualPort}\n`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      
      // Stop the scheduler service
      schedulerService.stop();
      
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
    
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
} else {
  // Export for testing or programmatic usage
  module.exports = { app, startServer };
}
