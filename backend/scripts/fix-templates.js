/**
 * This script repairs template documents by ensuring they have the correct
 * nested structure for technologies and bestPractices, and removes any
 * top-level fields that should be nested.
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function fixTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autoprompt');
    console.log('Connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Find all templates
    const templates = await db.collection('templates').find({}).toArray();
    console.log(`Found ${templates.length} templates to process`);
    
    let fixedCount = 0;
    
    for (const template of templates) {
      console.log(`Processing template: ${template.name} (${template._id})`);
      
      // Create well-formed technologies object if not present
      const technologies = template.technologies || {};
      const bestPractices = template.bestPractices || {};
      
      // Ensure technologies fields are arrays
      technologies.languages = Array.isArray(technologies.languages) ? technologies.languages : [];
      technologies.frameworks = Array.isArray(technologies.frameworks) ? technologies.frameworks : [];
      technologies.databases = Array.isArray(technologies.databases) ? technologies.databases : [];
      technologies.frontend = Array.isArray(technologies.frontend) ? technologies.frontend : [];
      technologies.backend = Array.isArray(technologies.backend) ? technologies.backend : [];
      technologies.testing = Array.isArray(technologies.testing) ? technologies.testing : [];
      technologies.devops = Array.isArray(technologies.devops) ? technologies.devops : [];
      
      // Ensure bestPractices fields are arrays
      bestPractices.designPatterns = Array.isArray(bestPractices.designPatterns) ? bestPractices.designPatterns : [];
      bestPractices.principles = Array.isArray(bestPractices.principles) ? bestPractices.principles : [];
      
      // Move any top-level arrays into their nested structure
      if (Array.isArray(template.languages)) {
        technologies.languages = [...new Set([...technologies.languages, ...template.languages])];
      }
      if (Array.isArray(template.frameworks)) {
        technologies.frameworks = [...new Set([...technologies.frameworks, ...template.frameworks])];
      }
      if (Array.isArray(template.databases)) {
        technologies.databases = [...new Set([...technologies.databases, ...template.databases])];
      }
      if (Array.isArray(template.frontend)) {
        technologies.frontend = [...new Set([...technologies.frontend, ...template.frontend])];
      }
      if (Array.isArray(template.backend)) {
        technologies.backend = [...new Set([...technologies.backend, ...template.backend])];
      }
      if (Array.isArray(template.testing)) {
        technologies.testing = [...new Set([...technologies.testing, ...template.testing])];
      }
      if (Array.isArray(template.devops)) {
        technologies.devops = [...new Set([...technologies.devops, ...template.devops])];
      }
      if (Array.isArray(template.designPatterns)) {
        bestPractices.designPatterns = [...new Set([...bestPractices.designPatterns, ...template.designPatterns])];
      }
      if (Array.isArray(template.principles)) {
        bestPractices.principles = [...new Set([...bestPractices.principles, ...template.principles])];
      }
      
      // Update the template with the fixed structure
      await db.collection('templates').updateOne(
        { _id: template._id },
        { 
          $set: { 
            technologies,
            bestPractices
          },
          $unset: {
            languages: "",
            frameworks: "",
            databases: "",
            frontend: "",
            backend: "",
            testing: "",
            devops: "",
            designPatterns: "",
            principles: ""
          }
        }
      );
      
      fixedCount++;
      console.log(`Fixed template: ${template.name}`);
    }
    
    console.log(`Fixed ${fixedCount} templates successfully`);
    
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

fixTemplates();
