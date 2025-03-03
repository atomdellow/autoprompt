const mongoose = require('mongoose');
require('dotenv').config();
const migration = require('../migrations/20230701000000-update-template-structure');

async function runMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autoprompt');
    console.log('Connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Run the migration
    console.log('Running migration...');
    await migration.up(db);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

runMigration();
