<template>
  <div class="prompt-generator">
    <h1>Prompt Generator</h1>

    <!-- Add loading state -->
    <div v-if="loading" class="loading">
      Loading templates...
    </div>

    <!-- Add error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="template-selector">
      <select 
        @change="onTemplateSelect"
        class="form-control"
        :disabled="loading"
      >
        <option value="">Select a template</option>
        <option v-for="temp in templates" :key="temp._id" :value="temp._id">
          {{ temp.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedTemplate" class="template-details">
      <h2>{{ selectedTemplate.name }}</h2>
      <p class="template-description">{{ selectedTemplate.description }}</p>
      
      <div class="selections">
        <div v-for="(options, category) in templateOptions" :key="category" class="section">
          <h3>{{ formatCategory(category) }}</h3>
          <MultiSelect
            v-model="selections[category]"
            :options="options"
            :multiple="true"
          />
        </div>

        <div class="form-group">
          <h3>Your Requirements</h3>
          <p class="help-text">Add any specific requirements or changes to the template:</p>
          <textarea
            v-model="userPrompt"
            placeholder="Describe what you want to build..."
            rows="4"
            class="form-control"
          ></textarea>
        </div>

        <button @click="generatePrompt" class="btn-primary">Generate Prompt</button>
      </div>
    </div>

    <div v-if="generatedPrompt" class="result">
      <h3>Generated Prompt</h3>
      <div class="prompt-text" v-html="formattedPrompt"></div>
      <div class="button-group">
        <button @click="copyToClipboard" class="btn-secondary">
          {{ copySuccess ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
        
        <!-- Add Save Prompt button -->
        <button @click="savePrompt" class="btn-primary">
          {{ savingPrompt ? 'Saving...' : 'Save Prompt' }}
        </button>
        
        <!-- Show these buttons only if template is for code generation -->
        <template v-if="selectedTemplate?.isCodeGenerator">
          <button @click="exportPrompt('copilot')" class="btn-primary">
            Send to Copilot
          </button>
          <button @click="exportPrompt('file')" class="btn-secondary">
            Save as File
          </button>
        </template>
        
        <!-- Show this for non-code generation templates -->
        <template v-else>
          <button @click="exportPrompt('markdown')" class="btn-secondary">
            Export as Markdown
          </button>
        </template>
      </div>
      
      <!-- Add feedback message for prompt saving -->
      <div v-if="promptSaveMessage" :class="`message ${promptSaveStatus}`">
        {{ promptSaveMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import MultiSelect from '../components/MultiSelect.vue';
import { useTemplateStore } from '../stores/template';
import api from '../utils/api';

const templateStore = useTemplateStore();
const selectedTemplate = ref(null);

// Define all available options for each category
const allOptions = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'C++'],
  frameworks: ['React', 'Vue', 'Angular', 'Express', 'Django', 'Spring Boot', 'Laravel', 'Next.js', 'Nest.js', 'Flask', 'FastAPI'],
  databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'DynamoDB', 'Firestore', 'Cassandra', 'Elasticsearch'],
  frontend: ['React', 'Vue', 'Angular', 'Svelte', 'Redux', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Styled Components'],
  backend: ['Express', 'Node.js', 'Django', 'Spring Boot', 'Laravel', 'Nest.js', 'FastAPI', 'Ruby on Rails', '.NET Core'],
  testing: ['Jest', 'Cypress', 'Mocha', 'Chai', 'Selenium', 'Playwright', 'React Testing Library', 'Vitest', 'PyTest'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'Terraform'],
  designPatterns: ['MVC', 'MVVM', 'Repository', 'Factory', 'Singleton', 'Observer', 'Strategy', 'Decorator', 'Adapter'],
  principles: ['SOLID', 'DRY', 'KISS', 'YAGNI', 'Single Responsibility', 'Separation of Concerns', 'Composition over Inheritance'],
  libraries: ['axios', 'lodash', 'moment', 'react-router', 'redux', 'vuex', 'pinia', 'mongoose', 'sequelize', 'typeorm']
};

// Initialize selections with empty arrays
const selections = reactive({
  languages: [],
  frameworks: [],
  databases: [],
  frontend: [],
  backend: [],
  testing: [],
  devops: [],
  designPatterns: [],
  principles: [],
  libraries: []
});

const generatedPrompt = ref('');
const loading = ref(false);
const error = ref(null);
const copySuccess = ref(false);
const userPrompt = ref('');

// Add these new state variables
const savingPrompt = ref(false);
const promptSaveMessage = ref('');
const promptSaveStatus = ref('');

// Get templates from store
const templates = computed(() => templateStore.templates);

// Format the prompt with basic Markdown styling for display
const formattedPrompt = computed(() => {
  if (!generatedPrompt.value) return '';
  
  return generatedPrompt.value
    // Format headings
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    // Format paragraphs
    .split('\n\n')
    .map(para => para.trim() ? `<p>${para}</p>` : '')
    .join('')
    // Replace line breaks
    .replace(/\n/g, '<br>');
});

// Handle template selection
const onTemplateSelect = (event) => {
  const templateId = event.target.value;
  
  if (!templateId) {
    selectedTemplate.value = null;
    clearSelections();
    return;
  }
  
  // Use the getTemplateById function from the store
  const template = templateStore.getTemplateById(templateId);
  if (!template) {
    console.error('Template not found:', templateId);
    error.value = `Template with ID ${templateId} not found`;
    return;
  }
  
  selectedTemplate.value = template;
  console.log('Selected template:', template);
  
  // Clear selections before populating
  clearSelections();
  
  // Handle both old and new data structures
  if (template.technologies) {
    // New nested structure
    populateSelections('languages', template.technologies.languages);
    populateSelections('frameworks', template.technologies.frameworks);
    populateSelections('databases', template.technologies.databases);
    populateSelections('frontend', template.technologies.frontend);
    populateSelections('backend', template.technologies.backend);
    populateSelections('testing', template.technologies.testing);
    populateSelections('devops', template.technologies.devops);
  } else {
    // Old flat structure
    populateSelections('languages', template.languages);
    populateSelections('frameworks', template.frameworks);
    populateSelections('databases', template.databases);
    populateSelections('frontend', template.frontend);
    populateSelections('backend', template.backend);
    populateSelections('testing', template.testing);
    populateSelections('devops', template.devops);
  }
  
  // Handle best practices
  if (template.bestPractices) {
    populateSelections('designPatterns', template.bestPractices.designPatterns);
    populateSelections('principles', template.bestPractices.principles);
  } else {
    populateSelections('designPatterns', template.designPatterns);
    populateSelections('principles', template.principles);
  }
  
  // Handle libraries
  populateSelections('libraries', template.libraries);
  
  userPrompt.value = '';
  generatedPrompt.value = ''; // Clear any previous prompt
};

// Helper to safely populate selections
function populateSelections(category, values) {
  if (Array.isArray(values)) {
    selections[category] = [...values];
  }
}

// Helper to clear all selections
function clearSelections() {
  Object.keys(selections).forEach(key => {
    selections[key] = [];
  });
}

// Computed: get available options for each category
// Now this returns ALL possible options for a category, plus any that are already in the template
const templateOptions = computed(() => {
  if (!selectedTemplate.value) {
    return allOptions;
  }
  
  // Start with all predefined options
  const result = { ...allOptions };
  
  // Add any extra options from the template that aren't in our defaults
  Object.keys(selections).forEach(category => {
    // Combine predefined options with any unique values from selections
    if (selections[category].length > 0) {
      result[category] = [...new Set([...result[category], ...selections[category]])];
    }
  });
  
  return result;
});

// Fetch templates when component mounts
onMounted(async () => {
  loading.value = true;
  try {
    await templateStore.fetchTemplates();
    console.log('Templates loaded:', templateStore.templates);
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load templates: ' + err.message;
    console.error('Failed to load templates:', err);
  } finally {
    loading.value = false;
  }
});

// Generate the prompt
const generatePrompt = async () => {
  if (!selectedTemplate.value) return;
  
  try {
    loading.value = true;
    const response = await api.post('/generate-prompt', {
      template: selectedTemplate.value,
      selections: selections,
      userPrompt: userPrompt.value
    });
    
    generatedPrompt.value = response.data.prompt;
  } catch (error) {
    console.error('Failed to generate prompt:', error);
    error.value = 'Failed to generate prompt: ' + error.message;
  } finally {
    loading.value = false;
  }
};

// Copy prompt to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Export prompt for different targets
const exportPrompt = async (type) => {
  if (type === 'copilot' && selectedTemplate.value?.isCodeGenerator) {
    const uri = `vscode://github.copilot/chat?prompt=${encodeURIComponent(generatedPrompt.value)}`;
    window.open(uri);
  } else if (type === 'file' && selectedTemplate.value?.isCodeGenerator) {
    const blob = new Blob([generatedPrompt.value], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  } else if (type === 'markdown') {
    const markdown = generatedPrompt.value; // Already in markdown format
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.md';
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// New function to save the prompt to the database
const savePrompt = async () => {
  if (!generatedPrompt.value || !selectedTemplate.value?._id) return;
  
  savingPrompt.value = true;
  promptSaveMessage.value = '';
  
  try {
    // Generate a title based on the current time
    const title = `${selectedTemplate.value.name} - ${new Date().toLocaleString()}`;
    
    // Save the prompt to the database
    const response = await api.post('/prompts', {
      title: title,
      content: generatedPrompt.value,
      templateId: selectedTemplate.value._id
    });
    
    // Show success message
    promptSaveMessage.value = 'Prompt saved successfully!';
    promptSaveStatus.value = 'success';
    
    console.log('Saved prompt:', response.data);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      promptSaveMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to save prompt:', error);
    promptSaveMessage.value = `Error: ${error.response?.data?.error || error.message}`;
    promptSaveStatus.value = 'error';
  } finally {
    savingPrompt.value = false;
  }
};

const formatCategory = (category) => {
  return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};
</script>

<style scoped>
/* Most existing styles remain the same */
.prompt-generator {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1024px;
  margin: 0 auto;
}

.template-details {
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.template-description {
  color: #64748b;
  margin-bottom: 1rem;
  font-style: italic;
}

.help-text {
  color: #64748b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Format the generated prompt better */
.prompt-text {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.25rem;
  white-space: normal;
  line-height: 1.6;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.prompt-text h2 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.prompt-text h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.prompt-text p {
  margin-bottom: 0.75rem;
}

/* Add style for the save message */
.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Rest of existing styles */
</style>
