<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Confirm Deletion</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="delete-confirmation">
          <p>Are you sure you want to delete "{{ app?.title }}"?</p>
          <div class="form-group">
            <label for="delete-reason">Reason for deletion</label>
            <textarea
              id="delete-reason" 
              v-model="localReason" 
              class="form-control"
              placeholder="Please provide a reason for deleting this app"
              required
            ></textarea>
          </div>
          
          <div class="warning-box">
            <p>
              <i class="warning-icon">⚠️</i>
              This will schedule the app for deletion in 7 days. You can cancel the deletion before that time.
            </p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="handleDelete" class="btn-danger" :disabled="!localReason.trim()">
          Schedule Deletion
        </button>
        <button @click="$emit('close')" class="btn-secondary">Cancel</button>
      </div>
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
  reason: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'delete', 'update:reason']);

const localReason = ref(props.reason);

watch(localReason, (value) => {
  emit('update:reason', value);
});

function handleDelete() {
  if (!localReason.value.trim()) return;
  emit('delete');
}
</script>

<style scoped>
.delete-confirmation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.warning-box {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.25rem;
}

.warning-box p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #856404;
}

.warning-icon {
  font-size: 1.25rem;
}
</style>
