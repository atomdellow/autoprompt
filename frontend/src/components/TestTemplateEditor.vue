<template>
  <div class="test-template-editor">
    <h2>Test Template Editor</h2>
    <p>This is a simplified editor to ensure data is actually saved correctly</p>
    
    <form @submit.prevent="saveTemplate" class="test-form">
      <div class="form-group">
        <label for="name">Template Name:</label>
        <input type="text" id="name" v-model="template.name" required />
      </div>
      
      <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" v-model="template.description" rows="2"></textarea>
      </div>
      
      <div class="form-group">
        <label for="structure">Template Structure:</label>
        <textarea 
          id="structure" 
          v-model="template.structure" 
          rows="5" 
          required
          placeholder="Create an application using {languages} with {frameworks}..."
        ></textarea>
      </div>
      
      <!-- Technologies Section -->
      <h3>Technologies</h3>
      
      <div class="form-group">
        <label>Languages:</label>
        <div class="tag-input">
          <input 
            type="text" 
            v-model="newLanguage" 
            @keyup.enter="addLanguage"
            placeholder="Type and press Enter"
          />
          <button type="button" @click="addLanguage">Add</button>
        </div>
        <div class="tag-list">
          <span v-for="(lang, index) in template.technologies.languages" :key="index" class="tag">
            {{ lang }}
            <button type="button" @click="removeLanguage(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>
      
      <div class="form-group">
        <label>Frameworks:</label>
        <div class="tag-input">
          <input 
            type="text" 
            v-model="newFramework" 
            @keyup.enter="addFramework"
            placeholder="Type and press Enter"
          />
          <button type="button" @click="addFramework">Add</button>
        </div>
        <div class="tag-list">
          <span v-for="(fw, index) in template.technologies.frameworks" :key="index" class="tag">
            {{ fw }}
            <button type="button" @click="removeFramework(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>
      
      <div class="form-group">
        <label>Databases:</label>
        <div class="tag-input">
          <input 
            type="text" 
            v-model="newDatabase" 
            @keyup.enter="addDatabase"
            placeholder="Type and press Enter"
          />
          <button type="button" @click="addDatabase">Add</button>
        </div>
        <div class="tag-list">
          <span v-for="(db, index) in template.technologies.databases" :key="index" class="tag">
            {{ db }}
            <button type="button" @click="removeDatabase(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-save">Save Template</button>
        <button type="button" @click="fillTestData" class="btn-test">Fill Test Data</button>
        <button type="button" @click="logTemplate" class="btn-log">Log Template Data</button>
      </div>
    </form>
    
    <div v-if="message" :class="`message ${messageType}`">
      {{ message }}
    </div>
    
    <pre v-if="savedData" class="saved-data">{{ savedData }}</pre>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '../utils/api';

// Simple reactive template with nested structure
const template = reactive({
  name: '',
  description: '',
  structure: '',
  technologies: {
    languages: [],
    frameworks: [],
    databases: [],
    frontend: [],
    backend: [],
    testing: [],
    devops: []
  },
  bestPractices: {
    designPatterns: [],
    principles: []
  },
  isCodeGenerator: true
});

// Form input state
const newLanguage = ref('');
const newFramework = ref('');
const newDatabase = ref('');
const message = ref('');
const messageType = ref(''); // 'success' or 'error'
const savedData = ref('');

// Add/remove languages
function addLanguage() {
  if (newLanguage.value.trim()) {
    template.technologies.languages.push(newLanguage.value.trim());
    newLanguage.value = '';
  }
}
function removeLanguage(index) {
  template.technologies.languages.splice(index, 1);
}

// Add/remove frameworks
function addFramework() {
  if (newFramework.value.trim()) {
    template.technologies.frameworks.push(newFramework.value.trim());
    newFramework.value = '';
  }
}
function removeFramework(index) {
  template.technologies.frameworks.splice(index, 1);
}

// Add/remove databases
function addDatabase() {
  if (newDatabase.value.trim()) {
    template.technologies.databases.push(newDatabase.value.trim());
    newDatabase.value = '';
  }
}
function removeDatabase(index) {
  template.technologies.databases.splice(index, 1);
}

// Fill form with test data
function fillTestData() {
  template.name = 'Test Template ' + new Date().toLocaleTimeString();
  template.description = 'This is a test template to verify data saving';
  template.structure = 'Create an application using {languages} with {frameworks} and {databases} for storage.';
  
  // Clear existing arrays
  template.technologies.languages = [];
  template.technologies.frameworks = [];
  template.technologies.databases = [];
  
  // Add test data
  template.technologies.languages.push('JavaScript', 'TypeScript');
  template.technologies.frameworks.push('React', 'Express');
  template.technologies.databases.push('MongoDB');
  
  message.value = 'Test data loaded';
  messageType.value = 'info';
}

// Direct API call to save template
async function saveTemplate() {
  try {
    message.value = 'Saving template...';
    messageType.value = 'info';
    
    // Log what we're about to send
    console.log('Saving template with data:', JSON.stringify(template, null, 2));
    
    // Make the API call directly (bypass the store for this test)
    const response = await api.post('/templates', template);
    
    // Show success message
    message.value = 'Template saved successfully!';
    messageType.value = 'success';
    
    // Show the saved data
    savedData.value = JSON.stringify(response.data, null, 2);
  } catch (error) {
    console.error('Failed to save template:', error);
    message.value = `Error: ${error.message || 'Failed to save'}`;
    messageType.value = 'error';
  }
}

// Log template state for debugging
function logTemplate() {
  console.log('Current template data:', JSON.stringify(template, null, 2));
  message.value = 'Template data logged to console';
  messageType.value = 'info';
}
</script>

<style scoped>
.test-template-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.test-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
}

input, textarea {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
}

.tag-input {
  display: flex;
  gap: 0.5rem;
}

.tag-input input {
  flex: 1;
}

.tag-input button {
  padding: 0.25rem 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  display: flex;
  align-items: center;
  background-color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #4b5563;
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-save {
  background-color: #10b981;
  color: white;
}

.btn-test {
  background-color: #8b5cf6;
  color: white;
}

.btn-log {
  background-color: #6b7280;
  color: white;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
}

.message.success {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
}

.message.error {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
}

.message.info {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
  color: #1e40af;
}

.saved-data {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #1e293b;
  color: #f8fafc;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
