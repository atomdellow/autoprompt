import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../utils/api';

export const useTemplateStore = defineStore('template', () => {
  const templates = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all templates
  async function fetchTemplates() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/templates');
      templates.value = response.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch templates';
      console.error('Error fetching templates:', err);
    } finally {
      loading.value = false;
    }
  }

  // Get template by ID - GET FROM STORE (doesn't need API call if already loaded)
  function getTemplateById(id) {
    return templates.value.find(template => template._id === id);
  }

  // Get a specific template - GET FROM API (useful when not already loaded)
  async function getTemplate(id) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (err) {
      error.value = err.message || `Failed to get template ${id}`;
      console.error(`Error getting template ${id}:`, err);
      throw err; // Re-throw to handle in the component
    } finally {
      loading.value = false;
    }
  }

  // Save a new template
  async function saveTemplate(templateData) {
    loading.value = true;
    error.value = null;
    
    try {
      // Make a deep clone to ensure no reactivity issues
      const clonedData = JSON.parse(JSON.stringify(templateData));
      console.log("Saving template data:", clonedData); // Debug log
      
      let response;
      if (clonedData._id) {
        // Update existing template
        response = await api.put(`/templates/${clonedData._id}`, clonedData);
      } else {
        // Create new template
        response = await api.post('/templates', clonedData);
      }
      
      // Refresh templates list
      await fetchTemplates();
      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to save template';
      console.error('Error saving template:', err);
      throw err; // Re-throw to handle in the component
    } finally {
      loading.value = false;
    }
  }

  // Delete a template
  async function deleteTemplate(id) {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/templates/${id}`);
      templates.value = templates.value.filter(t => t._id !== id);
    } catch (err) {
      error.value = err.message || `Failed to delete template ${id}`;
      console.error(`Error deleting template ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    getTemplateById, // Add the missing function
    saveTemplate,
    deleteTemplate
  };
});
