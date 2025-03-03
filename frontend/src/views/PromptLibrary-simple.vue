<template>
  <div class="prompt-library-simple">
    <h1>Prompt Library</h1>
    <p>This is a simplified version of the Prompt Library to verify routing.</p>
    
    <div class="test-buttons">
      <button @click="testApi" class="btn-primary">Test API Connection</button>
      <button @click="goToGenerator" class="btn-secondary">Go to Generator</button>
    </div>
    
    <div v-if="apiResult" class="api-result">
      <h3>API Test Result:</h3>
      <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();
const apiResult = ref(null);

// Simple API test
async function testApi() {
  try {
    const response = await api.get('/'); // Just hit the base API
    apiResult.value = response.data;
  } catch (error) {
    apiResult.value = { error: error.message };
  }
}

// Navigation test
function goToGenerator() {
  router.push('/generator');
}
</script>

<style scoped>
.prompt-library-simple {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.test-buttons {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e0;
}

.api-result {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 0.375rem;
  border: 1px solid #cbd5e0;
}

pre {
  white-space: pre-wrap;
  font-family: monospace;
  background-color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.25rem;
}
</style>
