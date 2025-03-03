<template>
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <p>{{ message || 'Error loading applications' }}</p>
    <button @click="$emit('retry')" class="retry-button">
      Try Again
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

p {
  color: #b91c1c;
  margin: 0 0 1rem 0;
  text-align: center;
}

.retry-button {
  padding: 0.625rem 1.25rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #dc2626;
}
</style>
