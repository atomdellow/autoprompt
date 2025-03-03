const axios = require('axios');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '../../projects/test-api-gen');

async function testGenerateCode() {
  try {
    console.log('Testing POST /projects/generate-code endpoint...');
    console.log(`URL: ${API_URL}/projects/generate-code`);
    
    const response = await axios.post(`${API_URL}/projects/generate-code`, {
      prompt: "Create a simple test API with a GET endpoint",
      name: "api-test-gen",
      projectType: "api",
      outputPath: DEFAULT_OUTPUT_PATH
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Request failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Error:', error.message);
    
    if (error.response && error.response.status === 404) {
      console.log('\n404 Error - Possible causes:');
      console.log('1. Route not registered correctly in server.js');
      console.log('2. URL path might be incorrect');
      console.log('3. Express router might not be connected properly');
      console.log('4. Server might be running a different version of the code');
    }
  }
}

testGenerateCode();
