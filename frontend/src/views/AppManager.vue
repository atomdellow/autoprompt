<template>
  <div class="app-manager">
    <div class="header-section">
      <h1>App Manager</h1>
      <button @click="openNewAppModal" class="btn-primary">New App</button>
    </div>

    <!-- Loading and error states -->
    <loading-state v-if="loading" />
    <error-state v-if="error" :message="error" @retry="loadApps" />

    <!-- Controls -->
    <div class="controls">
      <button @click="showImportModal = true" class="btn-primary">Import Apps</button>
      <button @click="openNewAppModal" class="btn-secondary">New App</button>
    </div>

    <!-- Search and filters -->
    <app-list-controls 
      v-model:searchQuery="searchQuery"
      v-model:sort="sorting"
      :sort-options="sortOptions"
      :total="total"
      @update:sort="handleSortChange"
      @clear-search="searchQuery = ''"
    />

    <!-- Empty state -->
    <div v-if="!loading && apps.length === 0" class="empty-state">
      No applications found
    </div>

    <!-- App list -->
    <div class="apps-list">
      <app-card
        v-for="app in displayedApps"
        :key="app._id"
        :app="app"
        :creating-now="creatingNow === app._id"
        @update-status="updateStatus"
        @edit="editApp"
        @delete="confirmDelete"
        @create-from="createFromApp"
        @create-now="createAppNow"
        @cancel-deletion="cancelDeletion"
      />
    </div>

    <!-- Pagination -->
    <data-pagination
      :total="total"
      :current-page="currentPage"
      :per-page="perPage"
      @update:pagination="handlePaginationChange"
    />

    <!-- Modals -->
    <new-app-modal
      v-if="showNewAppModal"
      :templates="templates"
      :prompts="prompts"
      :creating="creating"
      @close="showNewAppModal = false"
      @create="handleCreateApp"
    />

    <edit-app-modal
      v-if="showEditModal"
      :app="editingApp"
      :saving="saving"
      @close="showEditModal = false"
      @save="saveEdit"
    />

    <delete-confirmation-modal
      v-if="showDeleteModal"
      :app="deletingApp"
      v-model:reason="deleteReason"
      @close="showDeleteModal = false"
      @delete="scheduleDelete"
    />

    <import-app-modal 
      v-if="showImportModal"
      :uploading="uploading"
      :upload-error="uploadError"
      @close="showImportModal = false"
      @file-selected="handleFileUpload"
      @upload="uploadFile"
    />

    <create-from-app-modal
      v-if="showCreateFromModal"
      :source-app="sourceApp"
      :generating="generating"
      :generated-app="generatedApp"
      :generation-error="generationError"
      :default-path="defaultGenerationPath"
      @close="showCreateFromModal = false"
      @generate="generateFromApp"
      @open-generated="openGeneratedApp"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { debounce } from 'lodash';
import axios from 'axios';
import { formatDateForInput, formatTimeForInput } from '../utils/dateUtils';

// Import components
import LoadingState from '../components/states/LoadingState.vue';
import ErrorState from '../components/states/ErrorState.vue';
import AppCard from '../components/app/AppCard.vue';
import AppListControls from '../components/app/AppListControls.vue';
import DataPagination from '../components/DataPagination.vue';
import NewAppModal from '../components/modals/NewAppModal.vue';
import EditAppModal from '../components/modals/EditAppModal.vue';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal.vue';
import ImportAppModal from '../components/modals/ImportAppModal.vue';
import CreateFromAppModal from '../components/modals/CreateFromAppModal.vue';

// Import stores
import { useAppStore } from '../stores/app';
import { useTemplateStore } from '../stores/template';
import { usePaginationStore } from '../stores/pagination';
import api from '../utils/api';

// Setup API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Initialize stores
const appStore = useAppStore();
const templateStore = useTemplateStore();
const paginationStore = usePaginationStore();

// Initialize pagination store
paginationStore.$reset();

// Initialize reactive state
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const searchQuery = ref('');
const apps = ref([]);
const loading = ref(false);
const error = ref(null);

// Modal states
const showNewAppModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showImportModal = ref(false);
const showCreateFromModal = ref(false);

// Operation states
const creating = ref(false);
const saving = ref(false);
const uploading = ref(false);
const generating = ref(false);
const creatingNow = ref(null);

// Data for operations
const templates = ref([]);
const prompts = ref([]);
const editingApp = ref(null);
const deletingApp = ref(null);
const deleteReason = ref('');
const selectedFile = ref(null);
const uploadError = ref('');
const sourceApp = ref(null);
const generatedApp = ref(null);
const generationError = ref(null);
const defaultGenerationPath = ref('');

// Define sort options and default sort
const sortOptions = [
  { field: 'title', label: 'Title' },
  { field: 'status', label: 'Status' },
  { field: 'scheduled', label: 'Schedule Date' },
  { field: 'createdAt', label: 'Created Date' }
];

const defaultSort = {
  field: 'createdAt',
  order: 'desc'
};

// Single declaration of sorting ref
const sorting = ref({ ...defaultSort });

// Computed property for displayed apps
const displayedApps = computed(() => {
  const appsArray = Array.isArray(apps.value) ? apps.value : [];
  
  if (searchQuery.value.trim()) {
    // If search is active, only show apps that match the search query
    return appsArray.filter(app => {
      const search = searchQuery.value.toLowerCase();
      return (
        app.title?.toLowerCase().includes(search) ||
        app.description?.toLowerCase().includes(search) ||
        app.path?.toLowerCase().includes(search) ||
        app.languages?.some(lang => lang.toLowerCase().includes(search)) ||
        app.frameworks?.some(framework => framework.toLowerCase().includes(search))
      );
    });
  }
  
  // If no search, show all apps
  return appsArray;
});

// Watch handlers
watch(sorting, (newSort) => {
  if (newSort.field !== undefined) {
    loadApps();
  }
}, { deep: true });

watch(() => paginationStore.pagination, (newVal) => {
  currentPage.value = newVal.page;
  perPage.value = newVal.perPage;
  total.value = newVal.total;
}, { deep: true });

watch(() => paginationStore.sorting, (newVal) => {
  sorting.value = newVal;
}, { deep: true });

watch(currentPage, () => {
  loadApps();
});

watch(searchQuery, (newValue, oldValue) => {
  if (newValue === '' && oldValue) {
    // Clear search and reset to show all
    appStore.clearSearch();
  } else {
    debounceSearch();
  }
});

// Modal handlers
function openNewAppModal() {
  showNewAppModal.value = true;
}

// Handler for creating a new app
async function handleCreateApp(appData) {
  creating.value = true;
  try {
    console.log('Sending app data to API:', appData);
    const response = await api.post('/apps', appData);
    console.log('App created:', response.data);
    showNewAppModal.value = false;
    await loadApps();
  } catch (error) {
    console.error('Failed to create app:', error);
    alert(`Failed to create app: ${error.response?.data?.error || error.message}`);
  } finally {
    creating.value = false;
  }
}

// Search with debounce
const debounceSearch = debounce(async () => {
  currentPage.value = 1;
  if (!searchQuery.value.trim()) {
    await appStore.clearSearch();
  } else {
    await loadApps();
  }
}, 300);

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Update sort handling
function handleSortChange(params) {
  console.log('Sort changed to:', params);
  sorting.value = {
    field: params.field || defaultSort.field,
    order: params.order || defaultSort.order
  };
}

// Handle pagination changes
function handlePaginationChange(params) {
  currentPage.value = params.page;
  perPage.value = params.perPage;
  paginationStore.updatePagination(params);
  loadApps();
}

// Load apps from API
async function loadApps() {
  loading.value = true;
  error.value = null;
  try {
    const result = await appStore.fetchApps({
      page: currentPage.value,
      perPage: perPage.value,
      sort: sorting.value,
      search: searchQuery.value?.trim()
    });
    
    if (result?.apps) {
      apps.value = Array.isArray(result.apps) ? result.apps : [];
      total.value = result.pagination.total;
    }
  } catch (err) {
    error.value = `Failed to load apps: ${err.message}`;
    console.error('Component: Error details:', err);
  } finally {
    loading.value = false;
  }
}

// File upload handlers
const handleFileUpload = (event) => {
  uploadError.value = '';
  selectedFile.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  uploadError.value = '';
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    
    await appStore.batchImport(formData);
    showImportModal.value = false;
    await loadApps();
  } catch (error) {
    uploadError.value = error.message || 'Failed to upload file';
    console.error('Upload error:', error);
  } finally {
    uploading.value = false;
  }
};

// App status update
const updateStatus = async (app, newStatus) => {
  await appStore.updateAppStatus(app._id, newStatus);
};

// Edit app handler
const editApp = (app) => {
  editingApp.value = { ...app };
  showEditModal.value = true;
};

// Save edited app
const saveEdit = async (appData) => {
  saving.value = true;
  try {
    console.log('Saving app data:', appData);
    await appStore.updateApp(appData._id, appData);
    showEditModal.value = false;
    await loadApps();
  } catch (error) {
    console.error('Failed to save:', error);
    alert(`Failed to save: ${error.response?.data?.error || error.message}`);
  } finally {
    saving.value = false;
  }
};

// Delete confirmation handling
const confirmDelete = (app) => {
  deletingApp.value = app;
  deleteReason.value = '';
  showDeleteModal.value = true;
};

// Schedule delete
const scheduleDelete = async () => {
  if (!deletingApp.value || !deleteReason.value) return;
  
  try {
    await appStore.scheduleDelete(deletingApp.value._id, deleteReason.value);
    showDeleteModal.value = false;
    await loadApps();
  } catch (error) {
    console.error('Failed to schedule deletion:', error);
    alert('Failed to schedule deletion: ' + error.message);
  }
};

// Cancel deletion
const cancelDeletion = async (app) => {
  try {
    await appStore.cancelDeletion(app._id);
    await loadApps();
  } catch (error) {
    console.error('Failed to cancel deletion:', error);
    alert('Failed to cancel deletion: ' + error.message);
  }
};

// Create from app
function createFromApp(app) {
  sourceApp.value = { ...app };
  
  const defaultPath = import.meta.env.VITE_PROJECTS_PATH || '/projects';
  defaultGenerationPath.value = `${defaultPath}/${app.title}-clone`;
  
  showCreateFromModal.value = true;
  generationError.value = null;
  generatedApp.value = null;
}

// Generate app from another app
async function generateFromApp(generationData) {
  generating.value = true;
  generationError.value = null;
  generatedApp.value = null;
  
  try {
    const response = await axios.post(`${API_URL}/projects/generate-from-app`, generationData);
    generatedApp.value = response.data;
    await loadApps();
  } catch (error) {
    console.error('Generation failed:', error);
    generationError.value = error.response?.data?.message || 'Failed to generate app';
  } finally {
    generating.value = false;
  }
}

// Open generated app
function openGeneratedApp() {
  if (!generatedApp.value) return;
  
  if (generatedApp.value.path) {
    const viewerUrl = import.meta.env.VITE_PROJECT_VIEWER_URL;
    if (viewerUrl) {
      window.open(`${viewerUrl}?path=${encodeURIComponent(generatedApp.value.path)}`, '_blank');
    } else {
      window.location.href = `/app/${generatedApp.value.id}`;
    }
  }
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

// Create app now (immediately)
async function createAppNow(app) {
  if (!app || !app._id) return;
  
  creatingNow.value = app._id;
  
  try {
    await axios.post(`${API_URL}/apps/${app._id}/create-now`);
    alert(`${app.title} is being created now!`);
    await loadApps();
  } catch (error) {
    console.error('Failed to create app immediately:', error);
    alert(`Error creating app: ${error.response?.data?.message || error.message}`);
  } finally {
    creatingNow.value = null;
  }
}

// Load templates and prompts when component mounts
onMounted(async () => {
  try {
    const templateResponse = await api.get('/templates');
    templates.value = templateResponse.data;
    
    const promptResponse = await api.get('/prompts');
    prompts.value = promptResponse.data;
    
    await loadApps();
  } catch (error) {
    console.error('Error loading data:', error);
  }
});
</script>

<style src="../styles/app-manager.css" scoped></style>