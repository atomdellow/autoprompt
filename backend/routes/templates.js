const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ updatedAt: -1 });
    res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific template
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error(`Error fetching template ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new template
router.post('/', async (req, res) => {
  try {
    // Log the exact data we received for debugging
    console.log('RECEIVED TEMPLATE DATA:', JSON.stringify(req.body, null, 2));
    
    // Ensure we have all required fields
    if (!req.body.name || !req.body.structure) {
      return res.status(400).json({ error: 'Name and structure are required fields' });
    }
    
    // Prepare the template data - ensure proper structure even if client sends incomplete data
    const templateData = {
      name: req.body.name,
      description: req.body.description || '',
      structure: req.body.structure,
      technologies: {
        languages: Array.isArray(req.body.technologies?.languages) ? req.body.technologies.languages : [],
        frameworks: Array.isArray(req.body.technologies?.frameworks) ? req.body.technologies.frameworks : [],
        databases: Array.isArray(req.body.technologies?.databases) ? req.body.technologies.databases : [],
        frontend: Array.isArray(req.body.technologies?.frontend) ? req.body.technologies.frontend : [],
        backend: Array.isArray(req.body.technologies?.backend) ? req.body.technologies.backend : [],
        testing: Array.isArray(req.body.technologies?.testing) ? req.body.technologies.testing : [],
        devops: Array.isArray(req.body.technologies?.devops) ? req.body.technologies.devops : []
      },
      bestPractices: {
        designPatterns: Array.isArray(req.body.bestPractices?.designPatterns) ? req.body.bestPractices.designPatterns : [],
        principles: Array.isArray(req.body.bestPractices?.principles) ? req.body.bestPractices.principles : []
      },
      isCodeGenerator: Boolean(req.body.isCodeGenerator),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create a new template document
    const template = new Template(templateData);
    
    // Save the template
    const savedTemplate = await template.save();
    
    // Log the saved template for verification
    console.log('SAVED TEMPLATE:', JSON.stringify(savedTemplate.toObject(), null, 2));
    
    res.status(201).json(savedTemplate);
  } catch (err) {
    console.error('Error creating template:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing template
router.put('/:id', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log(`Updating template ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    // Prepare the update data - ensure proper structure 
    const updateData = {
      name: req.body.name,
      description: req.body.description || '',
      structure: req.body.structure,
      technologies: {
        languages: Array.isArray(req.body.technologies?.languages) ? req.body.technologies.languages : [],
        frameworks: Array.isArray(req.body.technologies?.frameworks) ? req.body.technologies.frameworks : [],
        databases: Array.isArray(req.body.technologies?.databases) ? req.body.technologies.databases : [],
        frontend: Array.isArray(req.body.technologies?.frontend) ? req.body.technologies.frontend : [],
        backend: Array.isArray(req.body.technologies?.backend) ? req.body.technologies.backend : [],
        testing: Array.isArray(req.body.technologies?.testing) ? req.body.technologies.testing : [],
        devops: Array.isArray(req.body.technologies?.devops) ? req.body.technologies.devops : []
      },
      bestPractices: {
        designPatterns: Array.isArray(req.body.bestPractices?.designPatterns) ? req.body.bestPractices.designPatterns : [],
        principles: Array.isArray(req.body.bestPractices?.principles) ? req.body.bestPractices.principles : []
      },
      isCodeGenerator: Boolean(req.body.isCodeGenerator),
      updatedAt: new Date()
    };
    
    // Find and update the document
    const template = await Template.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Log the updated template for verification
    console.log('UPDATED TEMPLATE:', JSON.stringify(template.toObject(), null, 2));
    
    res.json(template);
  } catch (err) {
    console.error(`Error updating template ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error(`Error deleting template ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
