<template>
  <div class="apps-page">
    <h1>App Manager</h1>
    
    <!-- Add create options -->
    <div class="creation-options">
      <h2>Create New App</h2>
      <div class="options-grid">
        <div class="creation-card" @click="createFromTemplate">
          <div class="creation-icon">📄</div>
          <h3>From Template</h3>
          <p>Create an app using a predefined template structure</p>
        </div>
        
        <div class="creation-card" @click="createFromPrompt">
          <div class="creation-icon">💬</div>
          <h3>From Prompt</h3>
          <p>Create an app using a saved or custom prompt</p>
        </div>
      </div>
    </div>
    
    <!-- Creation Modal -->
    <div v-if="showCreationModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ creationMode === 'template' ? 'Create from Template' : 'Create from Prompt' }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Template selection -->
          <div v-if="creationMode === 'template'" class="template-select">
            <label for="template-select">Select Template:</label>
            <select id="template-select" v-model="selectedTemplateId" class="form-control">
              <option value="">-- Select a Template --</option>
              <option v-for="template in templates" :key="template._id" :value="template._id">
                {{ template.name }}
              </option>
            </select>
            
            <div v-if="selectedTemplateId" class="template-details">
              <h4>{{ selectedTemplate?.name }}</h4>
              <p>{{ selectedTemplate?.description }}</p>
            </div>
          </div>
          
          <!-- Prompt selection -->
          <div v-if="creationMode === 'prompt'" class="prompt-select">
            <div class="radio-group">
              <label>
                <input type="radio" v-model="promptSource" value="saved" />
                Use Saved Prompt
              </label>
              <label>
                <input type="radio" v-model="promptSource" value="custom" />
                Enter Custom Prompt
              </label>
            </div>
            
            <!-- Saved prompt selector -->
            <div v-if="promptSource === 'saved'" class="saved-prompts">
              <label for="prompt-select">Select Saved Prompt:</label>
              <select id="prompt-select" v-model="selectedPromptId" class="form-control">
                <option value="">-- Select a Prompt --</option>
                <option v-for="prompt in prompts" :key="prompt._id" :value="prompt._id">
                  {{ prompt.title }}
                </option>
              </select>
              
              <div v-if="selectedPromptId" class="prompt-preview">
                <h4>{{ selectedPrompt?.title }}</h4>
                <pre class="prompt-content">{{ selectedPrompt?.content.substring(0, 200) }}{{ selectedPrompt?.content.length > 200 ? '...' : '' }}</pre>
                <button @click="viewFullPrompt" class="btn-secondary">View Full Prompt</button>
              </div>
            </div>
            
            <!-- Custom prompt input -->
            <div v-if="promptSource === 'custom'" class="custom-prompt">
              <label for="custom-prompt-input">Enter your prompt:</label>
              <textarea 
                id="custom-prompt-input" 
                v-model="customPromptText" 
                rows="8" 
                class="form-control"
                placeholder="Describe the app you want to create..."
              ></textarea>
            </div>
          </div>
          
          <!-- App configuration -->
          <div class="app-config">
            <h3>App Configuration</h3>
            <div class="form-group">
              <label for="app-name">App Name:</label>
              <input type="text" id="app-name" v-model="appName" class="form-control" placeholder="My New App" />
            </div>
            
            <div class="form-group">
              <label for="app-description">Description:</label>
              <textarea 
                id="app-description" 
                v-model="appDescription" 
                class="form-control" 
                rows="2"
                placeholder="Brief description of your app"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancel</button>
          <button @click="createApp" class="btn-primary" :disabled="!isFormValid">Create App</button>
        </div>
      </div>
    </div>
    
    <!-- Existing app list -->
    <div class="app-list">
      <h2>Your Apps</h2>
      <!-- Existing app list code can remain unchanged -->
    </div>
    
    <!-- App details view -->
    <!-- Existing app details code can remain unchanged -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../utils/api';

// App creation state
const showCreationModal = ref(false);
const creationMode = ref('template'); // 'template' or 'prompt'
const selectedTemplateId = ref('');
const selectedPromptId = ref('');
const promptSource = ref('saved'); // 'saved' or 'custom'
const customPromptText = ref('');
const appName = ref('');
const appDescription = ref('');

// Data from API
const templates = ref([]);
const prompts = ref([]);
const apps = ref([]);

// Selected items
const selectedTemplate = computed(() => {
  return templates.value.find(t => t._id === selectedTemplateId.value) || null;
});

const selectedPrompt = computed(() => {
  return prompts.value.find(p => p._id === selectedPromptId.value) || null;
});

// Form validation
const isFormValid = computed(() => {
  if (!appName.value.trim()) return false;
  
  if (creationMode.value === 'template') {
    return !!selectedTemplateId.value;
  } else { // prompt mode
    if (promptSource.value === 'saved') {
      return !!selectedPromptId.value;
    } else { // custom prompt
      return !!customPromptText.value.trim();
    }
  }
});

// Open creation modal with specified mode
function createFromTemplate() {
  creationMode.value = 'template';
  showCreationModal.value = true;
}

function createFromPrompt() {
  creationMode.value = 'prompt';
  showCreationModal.value = true;
}

// Close modal and reset form
function closeModal() {
  showCreationModal.value = false;
  resetForm();
}

function resetForm() {
  selectedTemplateId.value = '';
  selectedPromptId.value = '';
  customPromptText.value = '';
  appName.value = '';
  appDescription.value = '';
}

// View full prompt content
function viewFullPrompt() {
  if (!selectedPrompt.value) return;
  
  // Could show in a separate modal or expand current view
  alert(selectedPrompt.value.content);
}

// Create app with current settings
async function createApp() {
  if (!isFormValid.value) return;
  
  try {
    let payload = {
      name: appName.value.trim(),
      description: appDescription.value.trim()
    };
    
    if (creationMode.value === 'template') {
      payload.templateId = selectedTemplateId.value;
    } else {
      if (promptSource.value === 'saved') {
        payload.promptId = selectedPromptId.value;
      } else {
        payload.promptContent = customPromptText.value;
      }
    }
    
    const response = await api.post('/apps', payload);
    console.log('App created:', response.data);
    
    // Refresh app list or navigate to new app
    closeModal();
    loadApps(); // Assuming this function exists to load the app list
  } catch (error) {
    console.error('Failed to create app:', error);
    alert(`Error creating app: ${error.response?.data?.error || error.message}`);
  }
}

// Load data on component mount
onMounted(async () => {
  try {
    // Load templates
    const templateResponse = await api.get('/templates');
    templates.value = templateResponse.data;
    
    // Load prompts
    const promptResponse = await api.get('/prompts');
    prompts.value = promptResponse.data;
    
    // Load apps (assuming this endpoint exists)
    loadApps();
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Load apps from API
async function loadApps() {
  try {
    const response = await api.get('/apps');
    apps.value = response.data;
  } catch (error) {
    console.error('Failed to load apps:', error);
  }
}
</script>

<style scoped>
.apps-page {
  max-width: 1200px;
  margin: 0 auto;
}

.creation-options {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.creation-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.creation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.creation-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

/* Form controls */
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

/* Template and prompt specific styling */
.template-details, .prompt-preview {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.prompt-content {
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.25rem;
  font-family: monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Buttons */
.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e0;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

/* App list styling */
.app-list {
  margin-top: 2rem;
}

/* Sections */
.template-select, .prompt-select, .app-config {
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

/* Add these overrides if needed for your theme */
label {
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}
</style>
