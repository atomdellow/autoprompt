<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <p>Loading applications...</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: #64748b;
  margin: 0;
}
</style>
