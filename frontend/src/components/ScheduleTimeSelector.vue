<template>
  <div class="schedule-time-selector">
    <div class="date-time-inputs">
      <div class="input-group">
        <label for="schedule-date">Date:</label>
        <input 
          id="schedule-date" 
          type="date" 
          v-model="selectedDate" 
          class="form-control" 
          @change="validateAndEmit"
        >
      </div>
      
      <div class="input-group">
        <label for="schedule-time">Time:</label>
        <input 
          id="schedule-time" 
          type="time" 
          v-model="selectedTime" 
          class="form-control" 
          @change="validateAndEmit"
        >
      </div>
    </div>
    
    <div class="quick-options">
      <button type="button" @click="setToTomorrow" class="quick-option-btn">Tomorrow 9:00 AM</button>
      <button type="button" @click="setToNextWeek" class="quick-option-btn">Next Week</button>
      <button type="button" @click="setToNextMonth" class="quick-option-btn">Next Month</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { formatDateForInput } from '../utils/dateUtils';

const props = defineProps({
  initialDate: {
    type: Date,
    default: null
  },
  initialTime: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:datetime', 'validation-error']);

// Set default to tomorrow 9:00 AM if no initial date/time provided
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

// Initialize with defaults or provided values
const selectedDate = ref(props.initialDate ? formatDateForInput(props.initialDate) : formatDateForInput(tomorrow));
const selectedTime = ref(props.initialTime || '09:00');

// Initialize the component
onMounted(() => {
  if (props.initialDate) {
    validateAndEmit();
  } else {
    // Set default datetime on mount if not provided
    emit('update:datetime', tomorrow);
  }
});

// Watch for external prop changes
watch(() => props.initialDate, (newDate) => {
  if (newDate) {
    selectedDate.value = formatDateForInput(newDate);
  }
});

watch(() => props.initialTime, (newTime) => {
  if (newTime) {
    selectedTime.value = newTime;
  }
});

// Quick date setters
function setToTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  
  selectedDate.value = formatDateForInput(date);
  selectedTime.value = '09:00';
  
  validateAndEmit();
}

function setToNextWeek() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(9, 0, 0, 0);
  
  selectedDate.value = formatDateForInput(date);
  selectedTime.value = '09:00';
  
  validateAndEmit();
}

function setToNextMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setHours(9, 0, 0, 0);
  
  selectedDate.value = formatDateForInput(date);
  selectedTime.value = '09:00';
  
  validateAndEmit();
}

// Validate the date and emit the datetime
function validateAndEmit() {
  if (!selectedDate.value) {
    emit('validation-error', 'Please select a date');
    return;
  }
  
  if (!selectedTime.value) {
    emit('validation-error', 'Please select a time');
    return;
  }
  
  try {
    // Create a date from the selected date and time
    const dateStr = `${selectedDate.value}T${selectedTime.value}`;
    const dateTime = new Date(dateStr);
    
    // Validate it's a future date
    if (dateTime <= new Date()) {
      emit('validation-error', 'The scheduled time must be in the future');
      return;
    }
    
    // Clear any previous error
    emit('validation-error', '');
    
    // Emit the datetime object
    emit('update:datetime', dateTime);
  } catch (error) {
    emit('validation-error', 'Invalid date or time format');
  }
}
</script>

<style scoped>
.schedule-time-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-time-inputs {
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-group label {
  font-size: 0.875rem;
  color: #4b5563;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-option-btn {
  padding: 0.375rem 0.75rem;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-option-btn:hover {
  background-color: #e2e8f0;
}

@media (max-width: 640px) {
  .date-time-inputs {
    flex-direction: column;
  }
}
</style>
