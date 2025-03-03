<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create App from Template</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="sourceApp" class="create-from-app">
          <div class="source-app-info">
            <h4>Source App: {{ sourceApp.title }}</h4>
            <p>{{ sourceApp.description }}</p>
            
            <div v-if="sourceApp.promptUsed" class="source-prompt">
              <h5>Original Prompt</h5>
              <div class="prompt-box">{{ sourceApp.promptUsed }}</div>
            </div>
          </div>
          
          <form @submit.prevent="handleGenerate" class="generation-form">
            <div class="form-group">
              <label for="newAppName">New App Name</label>
              <input 
                id="newAppName" 
                v-model="newApp.name" 
                class="form-control" 
                required
                placeholder="Enter a name for the new app"
              />
            </div>
            
            <div class="form-group">
              <label for="newAppPath">Custom Path (Optional)</label>
              <input 
                id="newAppPath" 
                v-model="newApp.path" 
                class="form-control"
                placeholder="Leave blank for default path"
              />
              <small>Default: {{ defaultPath }}</small>
            </div>
            
            <div class="form-group">
              <label for="customPrompt">Additional Requirements (Optional)</label>
              <textarea 
                id="customPrompt" 
                v-model="newApp.customPrompt" 
                class="form-control"
                rows="4"
                placeholder="Add your specific requirements here..."
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-primary"
                :disabled="generating || !isValid"
              >
                <span v-if="generating">
                  <i class="fa-spinner"></i> Generating...
                </span>
                <span v-else>Generate App</span>
              </button>
              <button 
                type="button" 
                class="btn-secondary" 
                @click="$emit('close')"
                :disabled="generating"
              >
                Cancel
              </button>
            </div>
          </form>
          
          <div v-if="generationError" class="error-message">
            <p><strong>Error generating app:</strong></p>
            <p>{{ generationError }}</p>
          </div>
          
          <div v-if="generatedApp" class="success-message">
            <p><strong>App Generated Successfully!</strong></p>
            <p>Name: {{ generatedApp.name }}</p>
            <p>Path: {{ generatedApp.path }}</p>
            <button @click="openGeneratedApp" class="btn-success">Open Generated App</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  sourceApp: {
    type: Object,
    default: null
  },
  generating: {
    type: Boolean,
    default: false
  },
  generatedApp: {
    type: Object,
    default: null
  },
  generationError: {
    type: String,
    default: null
  },
  defaultPath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'generate', 'open-generated']);

const newApp = ref({
  name: '',
  path: '',
  customPrompt: ''
});

// Form validation
const isValid = computed(() => {
  return newApp.value.name && newApp.value.name.trim() !== '';
});

// Handle form submission for generating a new app
function handleGenerate() {
  if (!isValid.value || !props.sourceApp) return;
  
  const generationData = {
    name: newApp.value.name.trim(),
    sourceAppId: props.sourceApp._id,
    path: newApp.value.path.trim() || undefined,
    customPrompt: newApp.value.customPrompt.trim() || undefined
  };
  
  emit('generate', generationData);
}

// Open the generated app
function openGeneratedApp() {
  if (props.generatedApp) {
    emit('open-generated', props.generatedApp);
  }
}
</script>

<style scoped>
.create-from-app {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.source-app-info {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.source-app-info h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2563eb;
}

.source-prompt {
  margin-top: 1rem;
}

.source-prompt h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.prompt-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.875rem;
}

.generation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.success-message {
  background-color: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
}

.success-message p {
  margin: 0.5rem 0;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
  color: #b91c1c;
}

.btn-success {
  background-color: #22c55e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-success:hover {
  background-color: #16a34a;
}

small {
  color: #64748b;
  font-size: 0.75rem;
}
</style>