#!/usr/bin/env node
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const API_URL = 'http://localhost:3000/api';

const argv = yargs(hideBin(process.argv))
  .option('template', {
    alias: 't',
    description: 'Template ID to use',
    type: 'string'
  })
  .option('requirements', {
    alias: 'r',
    description: 'Specific requirements',
    type: 'string'
  })
  .option('output', {
    alias: 'o',
    description: 'Output file (optional)',
    type: 'string'
  })
  .option('format', {
    alias: 'f',
    description: 'Output format (text, json)',
    default: 'text',
    choices: ['text', 'json']
  })
  .demandOption(['template'])
  .argv;

async function generatePrompt() {
  try {
    const template = await axios.get(`${API_URL}/templates/${argv.template}`);
    
    const response = await axios.post(`${API_URL}/generate-prompt`, {
      template: template.data,
      userPrompt: argv.requirements
    });

    const result = argv.format === 'json' 
      ? JSON.stringify(response.data, null, 2)
      : response.data.prompt;

    if (argv.output) {
      require('fs').writeFileSync(argv.output, result);
      console.log(`Prompt saved to ${argv.output}`);
    } else {
      console.log(result);
    }
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

generatePrompt();
