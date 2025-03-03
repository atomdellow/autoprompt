import { defineStore } from 'pinia'
import axios from 'axios'

// Make API URL configurable and resilient
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAppStore = defineStore('app', {
  state: () => ({
    apps: [],
    loading: false,
    error: null,
    searchActive: false
  }),

  getters: {
    getAppById: (state) => (id) => {
      return state.apps.find(app => app._id === id)
    },
    
    getAppsByStatus: (state) => (status) => {
      return state.apps.filter(app => app.status === status)
    }
  },

  actions: {
    async fetchApps({ page = 1, perPage = 10, sort = null, search = '' } = {}) {
      this.loading = true;
      try {
        console.log(`Fetching apps from ${API_URL}/apps with:`, { page, perPage, sort, search });
        
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString()
        });

        this.searchActive = Boolean(search?.trim());
        
        if (this.searchActive) {
          queryParams.append('search', search.trim());
        }

        if (sort?.field) {
          queryParams.append('sort', JSON.stringify({
            field: sort.field,
            order: sort.order || 'desc'
          }));
        }

        const response = await axios.get(`${API_URL}/apps?${queryParams}`);
        console.log('API response:', response.status, response.statusText);
        return response.data;
      } catch (error) {
        console.error('Fetch error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSearch() {
      this.searchActive = false;
      this.filteredApps = [];
      return this.fetchApps();
    },

    async saveApp(app) {
      this.loading = true
      try {
        const response = await axios.post(`${API_URL}/apps`, app)
        this.apps.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.message
        console.error('Error saving app:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAppStatus(id, status) {
      try {
        const response = await axios.patch(`${API_URL}/apps/${id}/status`, { status })
        const index = this.apps.findIndex(app => app._id === id)
        if (index !== -1) {
          this.apps[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async batchImport(formData) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/apps/batch`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.apps.push(...response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        console.error('Batch import error:', error);
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async updateApp(id, appData) {
      this.loading = true;
      try {
        // Format date before sending to backend
        const formattedData = {
          ...appData,
          scheduled: appData.scheduled ? new Date(appData.scheduled).toISOString() : null
        };

        const response = await axios.put(`${API_URL}/apps/${id}`, formattedData);
        
        // Update local state
        const index = this.apps.findIndex(app => app._id === id);
        if (index !== -1) {
          this.apps[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Update error:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async scheduleDelete(id, reason) {
      this.loading = true;
      try {
        const response = await axios.delete(`${API_URL}/apps/${id}`, {
          data: { reason }
        });
        const index = this.apps.findIndex(app => app._id === id);
        if (index !== -1) {
          this.apps[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelDeletion(id) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/apps/${id}/restore`);
        const index = this.apps.findIndex(app => app._id === id);
        if (index !== -1) {
          this.apps[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get relationships for a specific app
     */
    async getAppRelationships(appId) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/apps/${appId}/relationships`);
        return response.data;
      } catch (error) {
        console.error('Error getting app relationships:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
})
