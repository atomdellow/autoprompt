<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New App</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <h3>Select a Creation Method</h3>
        
        <div class="creation-options">
          <div 
            class="option-card" 
            :class="{ active: creationMethod === 'template' }"
            @click="creationMethod = 'template'"
          >
            <div class="option-icon">📄</div>
            <h4>From Template</h4>
            <p>Create an app using a predefined template</p>
          </div>
          
          <div 
            class="option-card" 
            :class="{ active: creationMethod === 'prompt' }"
            @click="creationMethod = 'prompt'"
          >
            <div class="option-icon">💬</div>
            <h4>From Prompt</h4>
            <p>Create an app using a saved or custom prompt</p>
          </div>
        </div>
        
        <!-- Template Selection Form -->
        <div v-if="creationMethod === 'template'" class="creation-form">
          <div class="form-group">
            <label for="template-select">Select Template:</label>
            <select id="template-select" v-model="selectedTemplateId" class="form-control">
              <option value="">-- Select a Template --</option>
              <option v-for="template in templates" :key="template._id" :value="template._id">
                {{ template.name }}
              </option>
            </select>
            
            <div v-if="selectedTemplateId && selectedTemplate" class="selection-details">
              <h5>{{ selectedTemplate.name }}</h5>
              <p>{{ selectedTemplate.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- Prompt Selection Form -->
        <div v-if="creationMethod === 'prompt'" class="creation-form">
          <div class="form-group">
            <div class="radio-buttons">
              <label class="radio">
                <input type="radio" v-model="promptType" value="saved">
                <span>Use Saved Prompt</span>
              </label>
              <label class="radio">
                <input type="radio" v-model="promptType" value="custom">
                <span>Custom Prompt</span>
              </label>
            </div>
            
            <!-- Saved Prompt Selector -->
            <div v-if="promptType === 'saved'" class="form-group">
              <label for="prompt-select">Select Prompt:</label>
              <select id="prompt-select" v-model="selectedPromptId" class="form-control">
                <option value="">-- Select a Prompt --</option>
                <option v-for="prompt in prompts" :key="prompt._id" :value="prompt._id">
                  {{ prompt.title }}
                </option>
              </select>
              
              <div v-if="selectedPromptId && selectedPrompt" class="selection-details">
                <h5>{{ selectedPrompt.title }}</h5>
                <div class="prompt-preview">
                  {{ truncateText(selectedPrompt.content, 200) }}
                </div>
              </div>
            </div>
            
            <!-- Custom Prompt Input -->
            <div v-if="promptType === 'custom'" class="form-group">
              <label for="custom-prompt">Your Custom Prompt:</label>
              <textarea 
                id="custom-prompt" 
                v-model="customPrompt" 
                rows="6" 
                placeholder="Enter your requirements here..."
                class="form-control"
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- App Details Form -->
        <div class="form-group">
          <h3>App Details</h3>
          <label for="app-name">App Name:</label>
          <input type="text" id="app-name" v-model="newAppName" class="form-control" placeholder="My New App" required>
          
          <label for="app-description">Description:</label>
          <textarea 
            id="app-description" 
            v-model="newAppDescription" 
            class="form-control" 
            rows="2"
            placeholder="Brief description of your app"
          ></textarea>
          
          <label for="app-path">Path (Optional):</label>
          <input 
            type="text" 
            id="app-path" 
            v-model="newAppPath" 
            class="form-control" 
            placeholder="Leave blank for default location">
            
          <!-- Scheduling section -->
          <div class="form-group scheduling-section">
            <div class="schedule-toggle">
              <label class="checkbox-label">
                <input type="checkbox" v-model="scheduleNewApp" class="schedule-checkbox">
                <span>Schedule this app for later</span>
              </label>
            </div>
            
            <div v-if="scheduleNewApp" class="schedule-details">
              <label>Schedule Date and Time:</label>
              <schedule-time-selector
                @update:datetime="onScheduleSelected"
                @validation-error="scheduleError = $event"
              />
              
              <div v-if="scheduleError" class="validation-error">
                {{ scheduleError }}
              </div>
              
              <p class="schedule-note">
                <i class="schedule-icon">🕒</i>
                When scheduled, app will automatically be created at the specified time
              </p>
            </div>
          </div>
              
          <div class="form-group status-selection">
            <label>Status:</label>
            <select v-model="newAppStatus" class="form-control" :disabled="scheduleNewApp">
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
              <option v-if="scheduleNewApp" value="scheduled" selected>Scheduled</option>
            </select>
            <p v-if="scheduleNewApp" class="status-note">Status will be set to "Scheduled"</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">Cancel</button>
        <button 
          @click="createNewApp" 
          class="btn-primary"
          :disabled="creating || !isFormValid"
        >
          {{ creating ? 'Creating...' : 'Create App' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ScheduleTimeSelector from '../ScheduleTimeSelector.vue';

const props = defineProps({
  templates: {
    type: Array,
    default: () => []
  },
  prompts: {
    type: Array,
    default: () => []
  },
  creating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'create']);

// Form state
const creationMethod = ref('template');
const promptType = ref('saved');
const selectedTemplateId = ref('');
const selectedPromptId = ref('');
const customPrompt = ref('');
const newAppName = ref('');
const newAppDescription = ref('');
const newAppPath = ref('');
const newAppStatus = ref('planned');
const scheduleNewApp = ref(false);
const scheduleDateTime = ref(null);
const scheduleError = ref(null);

// Computed properties for selections
const selectedTemplate = computed(() => {
  return props.templates.find(t => t._id === selectedTemplateId.value);
});

const selectedPrompt = computed(() => {
  return props.prompts.find(p => p._id === selectedPromptId.value);
});

// Form validation
const isFormValid = computed(() => {
  if (!newAppName.value || newAppName.value.trim() === '') {
    return false;
  }
  
  if (creationMethod.value === 'template') {
    return !!selectedTemplateId.value;
  } else if (creationMethod.value === 'prompt') {
    if (promptType.value === 'saved') {
      return !!selectedPromptId.value;
    } else {
      return !!customPrompt.value && customPrompt.value.trim() !== '';
    }
  }
  
  return false;
});

// Watch for schedule checkbox changes
watch(scheduleNewApp, (newValue) => {
  if (newValue) {
    newAppStatus.value = 'scheduled';
  } else {
    newAppStatus.value = 'planned';
    scheduleDateTime.value = null;
  }
});

// Handle date/time selection
function onScheduleSelected(dateTime) {
  scheduleDateTime.value = dateTime;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Create new app
function createNewApp() {
  if (!isFormValid.value) return;
  
  let appData = {
    title: newAppName.value.trim(),
    description: newAppDescription.value.trim(),
    path: newAppPath.value.trim() || undefined,
    status: newAppStatus.value
  };
  
  // Add scheduling data if enabled
  if (scheduleNewApp.value && scheduleDateTime.value) {
    appData.scheduled = scheduleDateTime.value.toISOString();
    appData.status = 'scheduled'; // Ensure status is set to scheduled
  }
  
  if (creationMethod.value === 'template') {
    // Create from template
    appData.templateId = selectedTemplateId.value;
  } else {
    // Create from prompt
    if (promptType.value === 'saved') {
      appData.promptId = selectedPromptId.value;
    } else {
      appData.promptContent = customPrompt.value;
    }
  }
  
  console.log('Creating app with data:', appData);
  emit('create', appData);
}
</script>

<style src="../../styles/modals.css" scoped></style>