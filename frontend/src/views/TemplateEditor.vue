<template>
  <div class="template-editor">
    <!-- ADD PROMINENT MOCK DATA BUTTON HERE -->
    <div class="mock-data-banner">
      <button type="button" @click="fillWithMockData" class="btn-mock-prominent">
        👉 FILL WITH MOCK DATA 👈
      </button>
    </div>
    
    <h1>Template Editor</h1>
    
    <!-- Add notification banner -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <form @submit.prevent="saveTemplate" class="template-form">
      <div class="form-group">
        <input v-model="template.name" placeholder="Template Name" required class="form-control">
        <textarea v-model="template.description" placeholder="Description" class="form-control"></textarea>
      </div>
      
      <!-- Existing form groups -->
      <div class="form-group">
        <h3>Languages</h3>
        <tag-input v-model="template.technologies.languages" :suggestions="commonLanguages" />
      </div>

      <div class="form-group">
        <h3>Frameworks</h3>
        <tag-input v-model="template.technologies.frameworks" :suggestions="commonFrameworks" />
      </div>

      <div class="form-group">
        <h3>Databases</h3>
        <tag-input v-model="template.technologies.databases" :suggestions="commonDatabases" />
      </div>

      <div class="form-group">
        <h3>Principles</h3>
        <tag-input v-model="template.bestPractices.principles" :suggestions="commonPrinciples" />
      </div>

      <div class="form-group">
        <h3>Design Patterns</h3>
        <tag-input v-model="template.bestPractices.designPatterns" :suggestions="commonPatterns" />
      </div>

      <div class="form-group">
        <h3>Libraries & Packages</h3>
        <tag-input v-model="template.technologies.libraries" />
      </div>

      <div class="form-group">
        <h3>Template Structure</h3>
        <div class="help-text">
          <p>Use placeholders like {languages}, {frameworks}, {databases}, {principles}, {designPatterns}, and {libraries} in your template.</p>
          <p>Example template structure:</p>
          <pre>
Create a new application using {languages} with {frameworks} framework(s).
The application should use {databases} for data storage.
Please follow these principles: {principles}
Implement these design patterns: {designPatterns}
Use the following libraries: {libraries}

Additional requirements:
- Ensure proper error handling
- Include input validation
- Follow best practices for the chosen technology stack
          </pre>
        </div>
        <textarea 
          v-model="template.structure" 
          placeholder="Create a new application using {languages} with {frameworks} framework(s).
The application should use {databases} for data storage.
Please follow these principles: {principles}
Implement these design patterns: {designPatterns}
Use the following libraries: {libraries}"
          rows="10"
          required
          class="form-control"
        ></textarea>
      </div>

      <div class="form-group">
        <div class="toggle-container">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="template.isCodeGenerator"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-text">Use for Code Generation</span>
          </label>
          <div class="help-text" v-if="template.isCodeGenerator">
            This template will be used to generate code through configured integrations.
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Template' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, nextTick } from 'vue';
import TagInput from '../components/TagInput.vue';
import { useTemplateStore } from '../stores/template';
import api from '../utils/api';

const templateStore = useTemplateStore();

// Use reactive rather than shallowRef to ensure deep reactivity
const template = ref({
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
  isCodeGenerator: false
});

const commonLanguages = ['JavaScript', 'Python', 'C#', 'C++'];
const commonFrameworks = ['Vue', 'Express', 'jQuery', 'Flask', 'Django', '.NET'];
const commonDatabases = ['MongoDB', 'SQL', 'CSV', 'JSON'];
const commonPrinciples = ['SOLID', 'DRY', 'KISS'];
const commonPatterns = ['MVC', 'Template', 'Dependency Injection'];

const loading = ref(false);
const notification = ref(null);

// Fill with mock data function - FIXED to properly fill arrays
const fillWithMockData = () => {
  // Create mock data with proper structure
  const mockData = {
    name: 'Full Stack Web Application',
    description: 'A comprehensive template for modern web applications',
    structure: `Create a {languages} application using {frameworks} for the frontend
and {databases} for data storage.

Requirements:
1. Implement user authentication with JWT
2. Create a responsive dashboard UI 
3. Use {designPatterns} design patterns
4. Follow best practices including {principles}
5. Implement API endpoints for CRUD operations
6. Add comprehensive unit tests and integration tests

The application should use {frontend} for UI components, {backend} for server implementation, 
{testing} for test automation, and {devops} for CI/CD pipelines.`,
    technologies: {
      languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
      frameworks: ['React', 'Express', 'Next.js'],
      databases: ['MongoDB', 'Redis'],
      frontend: ['React Router', 'Redux', 'Tailwind CSS'],
      backend: ['Node.js', 'Express', 'Mongoose'],
      testing: ['Jest', 'React Testing Library', 'Supertest'],
      devops: ['Docker', 'GitHub Actions', 'AWS']
    },
    bestPractices: {
      designPatterns: ['MVC', 'Repository', 'Factory'],
      principles: ['SOLID', 'DRY', 'KISS']
    },
    isCodeGenerator: true
  };

  // Copy values to template - use JSON parse/stringify to avoid reactivity issues
  template.value = JSON.parse(JSON.stringify(mockData));
  
  // Show success notification
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'notification success fixed-notification';
  notificationDiv.textContent = 'Form filled with mock data!';
  document.body.appendChild(notificationDiv);

  setTimeout(() => {
    if (document.body.contains(notificationDiv)) {
      document.body.removeChild(notificationDiv);
    }
  }, 2000);
};

// FIXED save function that properly submits nested arrays
const saveTemplate = () => {
  if (!template.value.name || !template.value.structure) {
    // Show validation error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error fixed-notification';
    errorDiv.textContent = 'Please fill in all required fields';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 3000);
    return;
  }
  
  loading.value = true;
  
  // Create a direct copy of template data with arrays preserved
  const templateToSave = JSON.parse(JSON.stringify(template.value));
  
  // Log what we're about to send for verification
  console.log("SAVING TEMPLATE:", templateToSave);
  console.log("TECHNOLOGIES:", templateToSave.technologies);
  
  // Make direct API call to ensure data is properly sent
  api.post('/templates', templateToSave)
    .then((response) => {
      console.log("SAVED SUCCESSFULLY:", response.data);
      
      // Reset form with empty arrays
      template.value = {
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
        isCodeGenerator: false
      };
      
      // Show success via DOM
      const successDiv = document.createElement('div');
      successDiv.className = 'notification success fixed-notification';
      successDiv.textContent = 'Template saved successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
    })
    .catch(error => {
      // Show error via DOM
      const errorDiv = document.createElement('div');
      errorDiv.className = 'notification error fixed-notification';
      errorDiv.textContent = 'Failed to save template: ' + (error.message || 'Unknown error');
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 3000);
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style scoped>
/* Existing styles */
.template-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Add these new prominent styles for the mock button */
.mock-data-banner {
  background-color: #3730a3; /* Indigo 800 */
  padding: 16px;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-align: center;
}

.btn-mock-prominent {
  background-color: #fbbf24; /* Amber 400 */
  color: #000;
  font-weight: bold;
  font-size: 1rem;
  padding: 12px 24px;
  border: 2px solid #f59e0b; /* Amber 500 */
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
  transition: all 0.2s ease;
}

.btn-mock-prominent:hover {
  background-color: #f59e0b; /* Amber 500 */
  transform: scale(1.05);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Rest of existing styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.btn-primary {
  margin-top: 1rem;
}

.help-text {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.help-text pre {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  margin-top: 0.5rem;
}

.notification {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.notification.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.notification.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-container {
  margin: 1rem 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  margin-right: 0.5rem;
  transition: background 0.3s;
}

.toggle-switch:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-switch {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-switch:before {
  transform: translateX(24px);
}

.toggle-text {
  font-weight: 500;
}

/* Add this new style for DOM-based notifications */
:global(.fixed-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 0.25rem;
  z-index: 1000;
  animation: fadeInOut 3s ease;
}

:global(.notification.success) {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

:global(.notification.error) {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
