<template>
  <div class="app-scheduler">
    <h3>Schedule App Generation</h3>
    
    <div class="form-group">
      <label>Date and Time</label>
      <input 
        type="datetime-local" 
        v-model="scheduledDateTime"
        class="form-control"
        :min="minDateTime"
      />
    </div>
    
    <div class="form-group">
      <label>Priority</label>
      <select v-model="priority" class="form-control">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="repeat">
        Repeat
      </label>
    </div>
    
    <div v-if="repeat" class="repeat-options">
      <div class="form-group">
        <label>Frequency</label>
        <select v-model="repeatFrequency" class="form-control">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Every</label>
        <div class="interval-input">
          <input 
            type="number" 
            v-model="repeatInterval" 
            min="1" 
            class="form-control"
          />
          <span>{{ repeatFrequencyLabel }}</span>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button
        class="btn btn-primary"
        @click="scheduleApp"
        :disabled="!isFormValid"
      >
        Schedule App
      </button>
      
      <button
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'AppScheduler',
  
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  
  emits: ['cancel', 'scheduled'],
  
  setup(props, { emit }) {
    // Form state
    const scheduledDateTime = ref('');
    const priority = ref('medium');
    const repeat = ref(false);
    const repeatFrequency = ref('daily');
    const repeatInterval = ref(1);
    const error = ref('');
    
    // Calculate minimum datetime (now)
    const minDateTime = computed(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    });
    
    // Set default time (1 hour from now)
    const initDefaultTime = () => {
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
      const year = oneHourLater.getFullYear();
      const month = String(oneHourLater.getMonth() + 1).padStart(2, '0');
      const day = String(oneHourLater.getDate()).padStart(2, '0');
      const hours = String(oneHourLater.getHours()).padStart(2, '0');
      const minutes = String(oneHourLater.getMinutes()).padStart(2, '0');
      scheduledDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Call immediately to set the default time
    initDefaultTime();
    
    // Computed label for frequency
    const repeatFrequencyLabel = computed(() => {
      switch (repeatFrequency.value) {
        case 'daily': return repeatInterval.value === 1 ? 'day' : 'days';
        case 'weekly': return repeatInterval.value === 1 ? 'week' : 'weeks';
        case 'monthly': return repeatInterval.value === 1 ? 'month' : 'months';
        default: return '';
      }
    });
    
    // Form validation
    const isFormValid = computed(() => {
      return scheduledDateTime.value && 
        new Date(scheduledDateTime.value) > new Date() &&
        (!repeat.value || repeatInterval.value >= 1);
    });
    
    // Schedule the app
    const scheduleApp = async () => {
      try {
        error.value = '';
        
        // Prepare request data
        const data = {
          dateTime: scheduledDateTime.value,
          priority: priority.value
        };
        
        if (repeat.value) {
          data.repeat = true;
          data.repeatFrequency = repeatFrequency.value;
          data.repeatInterval = repeatInterval.value;
        }
        
        // Make API request
        const response = await axios.post(
          `/api/apps/${props.appId}/schedule`, 
          data
        );
        
        // Emit success event
        emit('scheduled', response.data);
      } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Failed to schedule app';
        console.error('Schedule error:', err);
      }
    };
    
    return {
      scheduledDateTime,
      priority,
      repeat,
      repeatFrequency,
      repeatInterval,
      repeatFrequencyLabel,
      isFormValid,
      minDateTime,
      error,
      scheduleApp
    };
  }
}
</script>

<style scoped>
.app-scheduler {
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.repeat-options {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.interval-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.interval-input input {
  width: 80px;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4a6cf7;
  color: white;
}

.btn-primary:disabled {
  background-color: #a0aef7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.error-message {
  margin-top: 1rem;
  padding: 0.5rem;
  color: #b71c1c;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
