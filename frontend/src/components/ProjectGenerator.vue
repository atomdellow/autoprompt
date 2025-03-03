<template>
  <div class="project-generator">
    <h3>Create Project from Template</h3>
    
    <div class="form-container">
      <form @submit.prevent="generateProject">
        <div class="form-group">
          <label for="projectName">Project Name</label>
          <input 
            id="projectName" 
            v-model="projectName" 
            type="text" 
            required
            class="form-control"
            :disabled="generating"
          />
        </div>
        
        <div class="form-group">
          <label for="projectPath">Project Path (optional)</label>
          <input 
            id="projectPath" 
            v-model="projectPath" 
            type="text"
            class="form-control"
            :disabled="generating" 
            placeholder="/path/to/project"
          />
        </div>
        
        <div class="form-group">
          <label for="templateSelect">Template</label>
          <select 
            id="templateSelect" 
            v-model="selectedTemplate"
            class="form-control"
            required
            :disabled="generating || loadingTemplates"
          >
            <option value="" disabled>Select a template</option>
            <option 
              v-for="template in templates" 
              :key="template._id" 
              :value="template._id"
            >
              {{ template.name }}
            </option>
          </select>
          <div v-if="loadingTemplates" class="loading-text">Loading templates...</div>
        </div>
        
        <div v-if="selectedTemplate" class="form-group">
          <label for="customPrompt">Custom Requirements</label>
          <textarea 
            id="customPrompt" 
            v-model="customPrompt"
            class="form-control"
            rows="6"
            :disabled="generating"
            placeholder="Enter additional requirements or customizations for your project..."
          ></textarea>
        </div>
        
        <div v-if="selectedTemplate && displayTechSelector" class="tech-selection">
          <h4>Select Technologies</h4>
          <TechnologySelector v-model:selected="selectedTechnologies" />
        </div>
        
        <div class="links-section" v-if="canLinkProjects">
          <h4>Link to Other Projects</h4>
          <div class="available-projects">
            <div 
              v-for="app in availableApps" 
              :key="app._id" 
              class="project-item"
            >
              <input 
                type="checkbox"
                :id="`app-${app._id}`"
                v-model="linkedProjects[app._id]"
                :disabled="generating"
              />
              <label :for="`app-${app._id}`">{{ app.title }}</label>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="generating || !selectedTemplate || !projectName"
          >
            <span v-if="generating">
              <i class="fas fa-spinner fa-spin"></i> Generating...
            </span>
            <span v-else>Generate Project</span>
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="resetForm"
            :disabled="generating"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="generationError" class="error-message">
      {{ generationError }}
    </div>
    
    <div v-if="generatedProject" class="success-message">
      <h4>Project Generated Successfully!</h4>
      <div class="project-info">
        <div><strong>Name:</strong> {{ generatedProject.name }}</div>
        <div><strong>Path:</strong> {{ generatedProject.path }}</div>
        <div><strong>Files created:</strong> {{ generatedProject.createdFiles?.length || 0 }}</div>
      </div>
      
      <div class="project-actions">
        <button 
          @click="openProject(generatedProject)" 
          class="btn btn-sm btn-success"
        >
          Open Project
        </button>
        <button 
          @click="startProject(generatedProject)"
          class="btn btn-sm btn-info"
        >
          Start Project
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useTemplateStore } from '../stores/template';
import { useAppStore } from '../stores/app';
import axios from 'axios';
import TechnologySelector from './TechnologySelector.vue';

// Stores
const templateStore = useTemplateStore();
const appStore = useAppStore();

// State
const templates = ref([]);
const loadingTemplates = ref(true);
const availableApps = ref([]);
const loadingApps = ref(true);

const projectName = ref('');
const projectPath = ref('');
const selectedTemplate = ref('');
const customPrompt = ref('');
const selectedTechnologies = ref([]);
const displayTechSelector = ref(true);
const linkedProjects = ref({});

const generating = ref(false);
const generationError = ref(null);
const generatedProject = ref(null);

// Computed
const canLinkProjects = computed(() => availableApps.value.length > 0);

// Methods
const generateProject = async () => {
  generating.value = true;
  generationError.value = null;
  generatedProject.value = null;
  
  try {
    // Prepare connections data
    const connections = Object.entries(linkedProjects.value)
      .filter(([_, isConnected]) => isConnected)
      .map(([appId]) => ({
        id: appId,
        type: 'dependency'
      }));

    const response = await axios.post('/api/projects/generate', {
      name: projectName.value,
      templateId: selectedTemplate.value,
      selections: {
        ...selectedTechnologies.value
      },
      customPrompt: customPrompt.value,
      projectPath: projectPath.value || undefined,
      connections
    });
    
    generatedProject.value = response.data;
  } catch (error) {
    console.error('Project generation failed:', error);
    generationError.value = error.response?.data?.message || error.message;
  } finally {
    generating.value = false;
  }
};

const resetForm = () => {
  projectName.value = '';
  projectPath.value = '';
  selectedTemplate.value = '';
  customPrompt.value = '';
  selectedTechnologies.value = [];
  Object.keys(linkedProjects.value).forEach(key => {
    linkedProjects.value[key] = false;
  });
  generationError.value = null;
  generatedProject.value = null;
};

const openProject = (project) => {
  // This could open the project in your other app
  window.open(`/project-view?path=${encodeURIComponent(project.path)}`, '_blank');
};

const startProject = async (project) => {
  try {
    const response = await axios.post(`/api/projects/${project.id}/start`);
    alert(`Project started on port ${response.data.port}`);
  } catch (error) {
    alert(`Failed to start project: ${error.response?.data?.message || error.message}`);
  }
};

// Load data
onMounted(async () => {
  try {
    // Load templates
    templates.value = await templateStore.fetchTemplates();
  } catch (error) {
    console.error('Error loading templates:', error);
  } finally {
    loadingTemplates.value = false;
  }
  
  try {
    // Load existing apps for linking
    const result = await appStore.fetchApps();
    availableApps.value = result.apps || [];
    
    // Initialize linkedProjects with false values
    availableApps.value.forEach(app => {
      linkedProjects.value[app._id] = false;
    });
  } catch (error) {
    console.error('Error loading apps:', error);
  } finally {
    loadingApps.value = false;
  }
});
</script>

<style scoped>
.project-generator {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.25rem;
}

textarea.form-control {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
}

.btn-secondary {
  background-color: #a0aec0;
  color: white;
}

.btn-success {
  background-color: #38a169;
  color: white;
}

.btn-info {
  background-color: #3182ce;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fed7d7;
  border-radius: 0.25rem;
  color: #c53030;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #c6f6d5;
  border-radius: 0.25rem;
  color: #2f855a;
}

.project-info {
  margin: 0.75rem 0;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tech-selection {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
}

.links-section {
  margin-bottom: 1.5rem;
}

.available-projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-text {
  color: #718096;
  font-style: italic;
  margin-top: 0.25rem;
}
</style>
