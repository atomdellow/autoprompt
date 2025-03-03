<template>
  <div class="prompt-library">
    <h1>Prompt Library</h1>
    
    <div v-if="loading" class="loading">
      Loading saved prompts...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="prompts.length === 0" class="empty-state">
      <p>No prompts have been saved yet.</p>
      <router-link to="/prompt-generator" class="btn-primary">
        Create a Prompt
      </router-link>
    </div>
    
    <div v-else class="prompt-list">
      <div v-for="prompt in prompts" :key="prompt._id" class="prompt-card">
        <div class="prompt-header">
          <h2>{{ prompt.title }}</h2>
          <span class="prompt-date">{{ formatDate(prompt.createdAt) }}</span>
        </div>
        
        <div class="prompt-actions">
          <button @click="viewPrompt(prompt)" class="btn-secondary">
            View
          </button>
          <button @click="copyPrompt(prompt)" class="btn-secondary">
            Copy
          </button>
          <button @click="deletePrompt(prompt._id)" class="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Prompt details modal -->
    <div v-if="selectedPrompt" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedPrompt.title }}</h2>
          <button @click="selectedPrompt = null" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <pre class="prompt-content">{{ selectedPrompt.content }}</pre>
        </div>
        <div class="modal-footer">
          <button @click="copyPrompt(selectedPrompt)" class="btn-secondary">
            Copy to Clipboard
          </button>
          <button @click="selectedPrompt = null" class="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api';

const prompts = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedPrompt = ref(null);

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Load prompts from the API
const loadPrompts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/prompts');
    prompts.value = response.data;
    console.log('Loaded prompts:', prompts.value);
  } catch (err) {
    console.error('Error loading prompts:', err);
    error.value = err.message || 'Failed to load prompts';
  } finally {
    loading.value = false;
  }
};

// View prompt details
const viewPrompt = (prompt) => {
  selectedPrompt.value = prompt;
};

// Copy prompt to clipboard
const copyPrompt = async (prompt) => {
  try {
    await navigator.clipboard.writeText(prompt.content);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
};

// Delete a prompt
const deletePrompt = async (id) => {
  if (!confirm('Are you sure you want to delete this prompt?')) {
    return;
  }
  
  try {
    await api.delete(`/prompts/${id}`);
    prompts.value = prompts.value.filter(p => p._id !== id);
  } catch (err) {
    console.error('Error deleting prompt:', err);
    alert('Failed to delete prompt');
  }
};

// Load prompts when component mounts
onMounted(() => {
  loadPrompts();
});
</script>

<style scoped>
.prompt-library {
  max-width: 1024px;
  margin: 0 auto;
  padding: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.prompt-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.prompt-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.prompt-header {
  margin-bottom: 1rem;
}

.prompt-header h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.prompt-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
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

.btn-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.prompt-content {
  white-space: pre-wrap;
  font-family: monospace;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  line-height: 1.6;
}
</style>
