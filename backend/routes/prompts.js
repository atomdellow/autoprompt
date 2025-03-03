const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Get all prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (err) {
    console.error('Error fetching prompts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (err) {
    console.error(`Error fetching prompt ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new prompt
router.post('/', async (req, res) => {
  try {
    // Required fields
    if (!req.body.content || !req.body.templateId) {
      return res.status(400).json({ error: 'Content and templateId are required' });
    }

    // Create the prompt with current timestamp
    const prompt = new Prompt({
      title: req.body.title || `Prompt ${new Date().toLocaleString()}`,
      content: req.body.content,
      templateId: req.body.templateId
    });

    const savedPrompt = await prompt.save();
    res.status(201).json(savedPrompt);
  } catch (err) {
    console.error('Error creating prompt:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a prompt
router.delete('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json({ message: 'Prompt deleted successfully' });
  } catch (err) {
    console.error(`Error deleting prompt ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
