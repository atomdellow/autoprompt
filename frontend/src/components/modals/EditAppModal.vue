<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Application</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveChanges" class="edit-form">
          <div class="form-group">
            <label for="edit-title">Title</label>
            <input id="edit-title" v-model="formData.title" required class="form-control">
          </div>
          
          <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea id="edit-description" v-model="formData.description" class="form-control"></textarea>
          </div>
          
          <div class="form-group scheduling-section">
            <div class="schedule-toggle">
              <label class="checkbox-label">
                <input type="checkbox" v-model="scheduleEnabled" class="schedule-checkbox">
                <span>Schedule this app</span>
              </label>
            </div>
            
            <div v-if="scheduleEnabled" class="schedule-details">
              <label>Schedule Date and Time:</label>
              <schedule-time-selector
                :initial-date="initialScheduleDate"
                :initial-time="initialScheduleTime"
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

          <div class="form-group">
            <label for="edit-languages">Languages</label>
            <input 
              id="edit-languages" 
              v-model="formData.languages" 
              placeholder="Comma separated values" 
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label for="edit-frameworks">Frameworks</label>
            <input 
              id="edit-frameworks" 
              v-model="formData.frameworks" 
              placeholder="Comma separated values" 
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="edit-status">Status</label>
            <select id="edit-status" v-model="formData.status" class="form-control" :disabled="scheduleEnabled">
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <p v-if="scheduleEnabled" class="status-note">Status will be set to "Scheduled" when saved</p>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="saving || scheduleError || !isChanged"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { formatDateForInput, formatTimeForInput } from '../../utils/dateUtils';
import ScheduleTimeSelector from '../ScheduleTimeSelector.vue';
import { cloneDeep } from 'lodash';

const props = defineProps({
  app: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  _id: '',
  title: '',
  description: '',
  status: 'planned',
  languages: '',
  frameworks: '',
  path: ''
});

const originalData = ref({});
const scheduleEnabled = ref(false);
const scheduleDateTime = ref(null);
const scheduleError = ref('');
const initialScheduleDate = ref(null);
const initialScheduleTime = ref(null);

// Check if form data has changed from original
const isChanged = computed(() => {
  if (scheduleEnabled.value !== !!props.app.scheduled) return true;
  
  // Convert formData back to comparable format
  const currentData = {
    ...formData.value,
    languages: typeof formData.value.languages === 'string'
      ? formData.value.languages.split(',').map(s => s.trim()).filter(Boolean)
      : formData.value.languages,
    frameworks: typeof formData.value.frameworks === 'string'
      ? formData.value.frameworks.split(',').map(s => s.trim()).filter(Boolean)
      : formData.value.frameworks
  };
  
  const originalFields = Object.keys(originalData.value);
  for (const key of originalFields) {
    // Skip schedule-related fields
    if (key === 'scheduled') continue;
    
    if (Array.isArray(originalData.value[key]) && Array.isArray(currentData[key])) {
      // Compare arrays
      if (originalData.value[key].length !== currentData[key].length) return true;
      for (let i = 0; i < originalData.value[key].length; i++) {
        if (originalData.value[key][i] !== currentData[key][i]) return true;
      }
    } else if (originalData.value[key] !== currentData[key]) {
      return true;
    }
  }
  
  // Check if schedule has changed
  if (scheduleEnabled.value && scheduleDateTime.value) {
    if (!props.app.scheduled) return true;
    if (new Date(props.app.scheduled).getTime() !== scheduleDateTime.value.getTime()) return true;
  }
  
  return false;
});

watch(() => props.app, (newApp) => {
  if (newApp) {
    initializeForm(newApp);
  }
}, { immediate: true, deep: true });

function initializeForm(app) {
  formData.value = {
    _id: app._id,
    title: app.title || '',
    description: app.description || '',
    status: app.status || 'planned',
    languages: Array.isArray(app.languages) ? app.languages.join(', ') : (app.languages || ''),
    frameworks: Array.isArray(app.frameworks) ? app.frameworks.join(', ') : (app.frameworks || ''),
    path: app.path || ''
  };
  
  // Clone original for comparison
  originalData.value = cloneDeep(app);
  
  // Initialize scheduling
  scheduleEnabled.value = !!app.scheduled;
  if (app.scheduled) {
    const scheduleDate = new Date(app.scheduled);
    scheduleDateTime.value = scheduleDate;
    initialScheduleDate.value = scheduleDate;
    initialScheduleTime.value = formatTimeForInput(scheduleDate);
  } else {
    scheduleDateTime.value = null;
    initialScheduleDate.value = null;
    initialScheduleTime.value = null;
  }
}

// Handle scheduling date/time selection
function onScheduleSelected(dateTime) {
  scheduleDateTime.value = dateTime;
  if (dateTime && scheduleEnabled.value) {
    formData.value.status = 'scheduled';
  }
}

// Handle schedule toggle
watch(scheduleEnabled, (enabled) => {
  if (enabled) {
    formData.value.status = 'scheduled';
    
    // If no date is set but checkbox is checked, initialize with tomorrow
    if (!scheduleDateTime.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      scheduleDateTime.value = tomorrow;
      initialScheduleDate.value = tomorrow;
      initialScheduleTime.value = formatTimeForInput(tomorrow);
    }
  } else if (formData.value.status === 'scheduled') {
    formData.value.status = 'planned';
  }
});

function saveChanges() {
  // Convert form data to API format
  const appData = {
    ...formData.value,
    // Convert comma-separated strings back to arrays
    languages: typeof formData.value.languages === 'string'
      ? formData.value.languages.split(',').map(s => s.trim()).filter(Boolean)
      : formData.value.languages,
    frameworks: typeof formData.value.frameworks === 'string'
      ? formData.value.frameworks.split(',').map(s => s.trim()).filter(Boolean)
      : formData.value.frameworks
  };
  
  // Add scheduling info
  if (scheduleEnabled.value && scheduleDateTime.value) {
    appData.scheduled = scheduleDateTime.value.toISOString();
    appData.status = 'scheduled'; // Ensure status is scheduled
  } else {
    appData.scheduled = null;
  }
  
  emit('save', appData);
}

onMounted(() => {
  if (props.app) {
    initializeForm(props.app);
  }
});
</script>

<style src="../../styles/modals.css" scoped></style>
