const mongoose = require('mongoose');
const path = require('path');
const Template = require('../models/Template');
const templates = require('./templates');

// Load environment variables from the correct path
require('dotenv').config({ 
  path: path.join(__dirname, '..', '.env') 
});

async function seedTemplates() {
  try {
    // Verify environment variable is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Attempting to connect to:', process.env.MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    const result = await Template.insertMany(templates);
    console.log(`Seeded ${result.length} templates`);

    // Log template names
    result.forEach(template => {
      console.log(`- ${template.name}`);
    });

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Run seeder
seedTemplates();
