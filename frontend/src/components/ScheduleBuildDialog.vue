<template>
  <div class="schedule-dialog">
    <div class="schedule-dialog-content">
      <div class="dialog-header">
        <h3>Schedule Build</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="dialog-body">
        <p>Select when you want to build this application:</p>
        
        <div class="section">
          <h4>Date and Time</h4>
          <schedule-time-selector
            :initial-date="initialDate"
            :initial-time="initialTime"
            @update:datetime="selectedDateTime = $event"
            @validation-error="validationError = $event"
          />
        </div>
        
        <div class="section">
          <h4>Priority</h4>
          <div class="priority-options">
            <label class="radio-option">
              <input type="radio" v-model="priority" value="low">
              <span>Low</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="priority" value="normal">
              <span>Normal</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="priority" value="high">
              <span>High</span>
            </label>
          </div>
        </div>
        
        <div class="section">
          <label class="checkbox-option">
            <input type="checkbox" v-model="repeat">
            <span>Repeat</span>
          </label>
          
          <div v-if="repeat" class="repeat-options">
            <div class="repeat-row">
              <label>Every</label>
              <input
                type="number"
                v-model.number="repeatInterval"
                min="1"
                class="repeat-interval"
              >
              <select v-model="repeatFrequency" class="repeat-frequency">
                <option value="daily">Day(s)</option>
                <option value="weekly">Week(s)</option>
                <option value="monthly">Month(s)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <div class="dialog-footer">
        <button
          class="btn btn-primary"
          @click="scheduleBuild"
          :disabled="!isFormValid || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>Schedule</span>
        </button>
        <button class="btn btn-secondary" @click="close">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import ScheduleTimeSelector from './ScheduleTimeSelector.vue';

export default {
  name: 'ScheduleBuildDialog',
  components: {
    ScheduleTimeSelector
  },
  props: {
    appId: {
      type: String,
      required: true
    },
    initialDateTime: {
      type: Date,
      default: null
    }
  },
  emits: ['close', 'scheduled'],
  
  setup(props, { emit }) {
    // Form state
    const selectedDateTime = ref(null);
    const priority = ref('normal');
    const repeat = ref(false);
    const repeatFrequency = ref('daily');
    const repeatInterval = ref(1);
    const loading = ref(false);
    const error = ref('');
    const validationError = ref('');
    
    // Initialize date and time from initialDateTime if provided
    const initialDate = computed(() => props.initialDateTime || new Date());
    
    const initialTime = computed(() => {
      if (props.initialDateTime) {
        const date = new Date(props.initialDateTime);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      return null;
    });
    
    // Form validation
    const isFormValid = computed(() => {
      return selectedDateTime.value && !validationError.value;
    });
    
    // Schedule the build
    const scheduleBuild = async () => {
      if (!isFormValid.value) return;
      
      try {
        loading.value = true;
        error.value = '';
        
        // Format the date for the API
        const data = {
          dateTime: selectedDateTime.value.toISOString(),
          priority: priority.value,
          repeat: repeat.value,
          repeatFrequency: repeatFrequency.value,
          repeatInterval: repeatInterval.value
        };
        
        // Make API request
        const response = await axios.post(`/api/apps/${props.appId}/schedule`, data);
        
        // Handle success
        emit('scheduled', response.data);
      } catch (err) {
        error.value = err.response?.data?.message || err.message;
        console.error('Failed to schedule build:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const close = () => {
      emit('close');
    };
    
    return {
      selectedDateTime,
      priority,
      repeat,
      repeatFrequency,
      repeatInterval,
      loading,
      error,
      validationError,
      isFormValid,
      initialDate,
      initialTime,
      scheduleBuild,
      close
    };
  }
}
</script>

<style scoped>
@import '../assets/styles/components/scheduleTimeSelector.css';

.schedule-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.schedule-dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.priority-options {
  display: flex;
  gap: 20px;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.repeat-options {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.repeat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.repeat-interval {
  width: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.repeat-frequency {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
