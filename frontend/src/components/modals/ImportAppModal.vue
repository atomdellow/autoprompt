<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Import Applications</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="upload-form">
          <div v-if="uploadError" class="error-message">
            {{ uploadError }}
          </div>
          
          <div class="file-upload">
            <label for="file-input" class="file-label">
              <span class="file-icon">📄</span>
              <span>Choose File</span>
              <span class="file-name">{{ selectedFileName || 'No file selected' }}</span>
            </label>
            <input
              id="file-input"
              type="file"
              class="file-input"
              @change="handleFileChange"
              accept=".csv,.json"
              :disabled="uploading"
            >
          </div>
          
          <div class="import-info">
            <h4>Supported Formats</h4>
            <ul>
              <li>CSV file with headers (title, description, status, etc.)</li>
              <li>JSON file with array of app objects</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          @click="$emit('upload')"
          class="btn-primary"
          :disabled="!hasFile || uploading"
        >
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
        <button @click="$emit('close')" class="btn-secondary" :disabled="uploading">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  uploading: {
    type: Boolean,
    default: false
  },
  uploadError: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'file-selected', 'upload']);

const selectedFile = ref(null);
const selectedFileName = ref('');

const hasFile = computed(() => !!selectedFile.value);

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
    emit('file-selected', event);
  } else {
    selectedFile.value = null;
    selectedFileName.value = '';
  }
}
</script>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-upload {
  position: relative;
  width: 100%;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.file-label:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  margin-left: auto;
  color: #64748b;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.import-info {
  background-color: #f1f9fe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 0.25rem;
}

.import-info h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #1e40af;
}

.import-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.import-info li {
  margin-bottom: 0.25rem;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border-left: 4px solid #dc2626;
}
</style>
