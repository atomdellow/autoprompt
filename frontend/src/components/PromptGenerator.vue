<template>
  <div class="prompt-generator">
    <div class="template-selector">
      <h3>Select a Template</h3>
      <select v-model="selectedTemplate" @change="onTemplateSelected" class="form-control">
        <option value="">-- Select Template --</option>
        <option v-for="template in templates" :key="template._id" :value="template._id">
          {{ template.name }}
        </option>
      </select>
    </div>
    
    <div v-if="currentTemplate" class="template-details">
      <h3>{{ currentTemplate.name }}</h3>
      <p>{{ currentTemplate.description }}</p>
      
      <div class="technologies-section">
        <div class="tech-selection">
          <h4>Languages</h4>
          <div class="checkbox-list">
            <div 
              v-for="language in availableLanguages" 
              :key="language" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :id="`lang-${language}`"
                :value="language"
                v-model="selectedLanguages"
                @change="regeneratePrompt"
              />
              <label :for="`lang-${language}`">{{ language }}</label>
            </div>
          </div>
        </div>
        
        <div class="tech-selection">
          <h4>Frameworks</h4>
          <div class="checkbox-list">
            <div 
              v-for="framework in availableFrameworks" 
              :key="framework" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :id="`framework-${framework}`"
                :value="framework"
                v-model="selectedFrameworks"
                @change="regeneratePrompt"
              />
              <label :for="`framework-${framework}`">{{ framework }}</label>
            </div>
          </div>
        </div>
        
        <div class="tech-selection">
          <h4>Databases</h4>
          <div class="checkbox-list">
            <div 
              v-for="database in availableDatabases" 
              :key="database" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :id="`db-${database}`"
                :value="database"
                v-model="selectedDatabases"
                @change="regeneratePrompt"
              />
              <label :for="`db-${database}`">{{ database }}</label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="best-practices-section">
        <div class="tech-selection">
          <h4>Design Patterns</h4>
          <div class="checkbox-list">
            <div 
              v-for="pattern in availableDesignPatterns" 
              :key="pattern" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :id="`pattern-${pattern}`"
                :value="pattern"
                v-model="selectedDesignPatterns"
                @change="regeneratePrompt"
              />
              <label :for="`pattern-${pattern}`">{{ pattern }}</label>
            </div>
          </div>
        </div>
        
        <div class="tech-selection">
          <h4>Principles</h4>
          <div class="checkbox-list">
            <div 
              v-for="principle in availablePrinciples" 
              :key="principle" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :id="`principle-${principle}`"
                :value="principle"
                v-model="selectedPrinciples"
                @change="regeneratePrompt"
              />
              <label :for="`principle-${principle}`">{{ principle }}</label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="user-prompt-section">
        <h3>Custom Requirements</h3>
        <textarea 
          v-model="userPrompt" 
          @input="regeneratePrompt"
          class="form-control user-prompt"
          placeholder="Add any specific project requirements..."
          rows="5"
        ></textarea>
      </div>
      
      <div class="generated-prompt-section">
        <h3>Generated Prompt</h3>
        <div class="prompt-actions">
          <button @click="copyToClipboard" class="btn btn-outline-primary">
            <i class="fas fa-clipboard"></i> Copy
          </button>
          <button @click="regeneratePrompt" class="btn btn-outline-secondary">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>
        <div class="generated-prompt">
          {{ generatedPrompt }}
        </div>
      </div>
      
      <div class="prompt-actions">
        <button 
          @click="submitPrompt" 
          class="btn btn-primary"
          :disabled="!generatedPrompt"
        >
          Generate Code from Prompt
        </button>
      </div>
    </div>
    
    <div v-else class="no-template">
      <p>Select a template to start generating your prompt.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'PromptGenerator',
  props: {
    templates: {
      type: Array,
      required: true
    }
  },
  
  setup(props) {
    const router = useRouter();
    const selectedTemplate = ref('');
    const currentTemplate = ref(null);
    const userPrompt = ref('');
    const generatedPrompt = ref('');
    
    // Technologies selections
    const selectedLanguages = ref([]);
    const selectedFrameworks = ref([]);
    const selectedDatabases = ref([]);
    const selectedDesignPatterns = ref([]);
    const selectedPrinciples = ref([]);
    
    // Available technology options from the template
    const availableLanguages = computed(() => {
      return currentTemplate.value?.technologies?.languages || [];
    });
    
    const availableFrameworks = computed(() => {
      return currentTemplate.value?.technologies?.frameworks || [];
    });
    
    const availableDatabases = computed(() => {
      return currentTemplate.value?.technologies?.databases || [];
    });
    
    const availableDesignPatterns = computed(() => {
      return currentTemplate.value?.bestPractices?.designPatterns || [];
    });
    
    const availablePrinciples = computed(() => {
      return currentTemplate.value?.bestPractices?.principles || [];
    });
    
    // When a template is selected, load its data
    const onTemplateSelected = () => {
      const template = props.templates.find(t => t._id === selectedTemplate.value);
      if (template) {
        currentTemplate.value = template;
        
        // Pre-select some technologies if available
        selectedLanguages.value = template?.technologies?.languages?.slice(0, 1) || [];
        selectedFrameworks.value = template?.technologies?.frameworks?.slice(0, 1) || [];
        selectedDatabases.value = template?.technologies?.databases?.slice(0, 1) || [];
        selectedDesignPatterns.value = template?.bestPractices?.designPatterns?.slice(0, 1) || [];
        selectedPrinciples.value = template?.bestPractices?.principles?.slice(0, 1) || [];
        
        regeneratePrompt();
      } else {
        currentTemplate.value = null;
        generatedPrompt.value = '';
      }
    };
    
    // Generate the prompt based on the current selections
    const regeneratePrompt = () => {
      if (!currentTemplate.value) return;
      
      let prompt = currentTemplate.value.structure;
      
      // Replace placeholders with actual selections
      prompt = prompt.replace(/{languages}/gi, selectedLanguages.value.join(', ') || '(no languages selected)');
      prompt = prompt.replace(/{frameworks}/gi, selectedFrameworks.value.join(', ') || '(no frameworks selected)');
      prompt = prompt.replace(/{databases}/gi, selectedDatabases.value.join(', ') || '(no databases selected)');
      prompt = prompt.replace(/{designPatterns}/gi, selectedDesignPatterns.value.join(', ') || '(no design patterns selected)');
      prompt = prompt.replace(/{principles}/gi, selectedPrinciples.value.join(', ') || '(no principles selected)');
      
      // Add user-defined prompt if provided
      if (userPrompt.value) {
        prompt += '\n\nAdditional Requirements:\n' + userPrompt.value;
      }
      
      generatedPrompt.value = prompt;
    };
    
    // Copy the generated prompt to clipboard
    const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedPrompt.value)
        .then(() => {
          // Show a temporary "copied" indication
          const originalPrompt = generatedPrompt.value;
          generatedPrompt.value = 'Copied to clipboard!';
          setTimeout(() => {
            generatedPrompt.value = originalPrompt;
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    };
    
    // Submit the prompt to generate code
    const submitPrompt = async () => {
      try {
        const response = await axios.post('/api/projects/generate-code', {
          prompt: generatedPrompt.value,
          name: `${currentTemplate.value.name}-${Date.now()}`,
          technologies: {
            languages: selectedLanguages.value,
            frameworks: selectedFrameworks.value,
            databases: selectedDatabases.value
          }
        });
        
        // Redirect to the project view or show a success message
        if (response.data && response.data.id) {
          router.push(`/projects/${response.data.id}`);
        }
      } catch (error) {
        console.error('Error generating code:', error);
        // Show error notification (would need a notification system)
      }
    };
    
    return {
      selectedTemplate,
      currentTemplate,
      userPrompt,
      generatedPrompt,
      selectedLanguages,
      selectedFrameworks,
      selectedDatabases,
      selectedDesignPatterns,
      selectedPrinciples,
      availableLanguages,
      availableFrameworks,
      availableDatabases,
      availableDesignPatterns,
      availablePrinciples,
      onTemplateSelected,
      regeneratePrompt,
      copyToClipboard,
      submitPrompt
    };
  }
};
</script>

<style scoped>
.prompt-generator {
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-selector {
  margin-bottom: 1.5rem;
}

.template-details {
  margin-top: 1.5rem;
}

.template-details h3 {
  margin-bottom: 0.5rem;
}

.template-details p {
  color: #666;
  margin-bottom: 1.5rem;
}

.technologies-section,
.best-practices-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tech-selection h4 {
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  min-width: 140px;
}

.checkbox-item input {
  margin-right: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.user-prompt-section {
  margin-bottom: 2rem;
}

.user-prompt {
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.generated-prompt-section {
  margin-bottom: 2rem;
}

.prompt-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.generated-prompt {
  font-family: monospace;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  white-space: pre-wrap;
  min-height: 200px;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-outline-primary {
  background-color: white;
  color: #2196f3;
  border: 1px solid #2196f3;
}

.btn-outline-secondary {
  background-color: white;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.no-template {
  padding: 2rem;
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>