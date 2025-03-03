const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const axios = require('axios');
const PromptGenerator = require('../lib/promptGenerator');

// Basic API information
router.get('/', (req, res) => {
  res.json({
    name: 'AutoPrompt API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/generate-prompt', method: 'POST', description: 'Generate a prompt based on a template' },
      { path: '/api/templates', method: 'GET', description: 'Get all templates' },
      { path: '/api/templates/:id', method: 'GET', description: 'Get a specific template' }
    ]
  });
});

router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate a prompt
router.post('/generate-prompt', (req, res) => {
  try {
    const { template, selections, userPrompt } = req.body;
    
    if (!template || !template.structure) {
      return res.status(400).json({ error: 'Template with structure is required' });
    }
    
    // Use the PromptGenerator to create the prompt
    const prompt = PromptGenerator.generate(template, selections, userPrompt);
    
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook/prompt', async (req, res) => {
  try {
    const { templateId, requirements, callbackUrl } = req.body;
    
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const prompt = PromptGenerator.generate(template, {}, requirements);

    if (callbackUrl) {
      await axios.post(callbackUrl, { prompt });
    }

    res.json({ prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
