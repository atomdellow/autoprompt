<template>
  <div class="app-card" :class="{ 'pending-deletion': app.deletionScheduled }">
    <h3>{{ app.title }}</h3>
    <p>{{ app.description }}</p>
    
    <div class="app-meta">
      <span class="status" :class="app.status">{{ app.status }}</span>
      
      <!-- Scheduling information -->
      <div v-if="app.scheduled" class="scheduling-info">
        <div class="scheduled-date">
          <i class="schedule-icon">🕒</i>
          Scheduled: {{ formatDatetime(app.scheduled) }}
        </div>
        <!-- Create Now button -->
        <button 
          @click="$emit('create-now', app)" 
          class="btn-create-now"
          :disabled="creatingNow"
        >
          {{ creatingNow ? 'Creating...' : 'Create Now' }}
        </button>
      </div>
    </div>
    
    <!-- Deletion warning -->
    <div v-if="app.deletionScheduled" class="deletion-warning">
      <p>Scheduled for deletion on: {{ new Date(app.deletionScheduled.date).toLocaleDateString() }}</p>
      <p>Reason: {{ app.deletionScheduled.reason }}</p>
      <button @click="$emit('cancel-deletion', app)" class="btn-warning">Cancel Deletion</button>
    </div>
    
    <!-- Tags -->
    <div class="tags">
      <span v-for="lang in app.languages" :key="lang" class="tag">
        {{ lang }}
      </span>
    </div>
    
    <!-- Actions -->
    <div class="actions">
      <select v-model="status" @change="updateStatus">
        <option value="planned">Planned</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
      <button @click="$emit('edit', app)" class="btn-secondary">Edit</button>
      <button @click="$emit('delete', app)" class="btn-danger" v-if="!app.deletionScheduled">Delete</button>
      <button @click="$emit('create-from', app)" class="btn-success">Create from This</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  app: {
    type: Object,
    required: true
  },
  creatingNow: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-status', 'edit', 'delete', 'create-from', 'create-now', 'cancel-deletion']);

const status = ref(props.app.status);

// Watch for external changes to app status
watch(() => props.app.status, (newStatus) => {
  status.value = newStatus;
});

// Update status and emit event
function updateStatus() {
  emit('update-status', props.app, status.value);
}

// Format datetime for display
function formatDatetime(dateStr) {
  const date = new Date(dateStr);
  
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
</script>

<style src="../../styles/app-card.css" scoped></style>
