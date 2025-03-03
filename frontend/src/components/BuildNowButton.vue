<template>
  <div class="build-now-wrapper">
    <button
      @click="showConfirm = true"
      class="btn btn-primary build-now-btn"
      :disabled="loading || disabled"
    >
      <span v-if="!loading">{{ text }}</span>
      <span v-else class="loading-spinner"></span>
    </button>
    
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="confirm-content">
        <h3>Build Now</h3>
        <p>Are you sure you want to build this app immediately?</p>
        
        <div class="priority-selection">
          <label>Priority:</label>
          <div class="priority-options">
            <label>
              <input type="radio" v-model="buildPriority" value="low">
              Low
            </label>
            <label>
              <input type="radio" v-model="buildPriority" value="normal">
              Normal
            </label>
            <label>
              <input type="radio" v-model="buildPriority" value="high">
              High
            </label>
          </div>
        </div>
        
        <div class="confirm-actions">
          <button @click="buildNow" class="btn btn-success" :disabled="loading">
            <span v-if="!loading">Build Now</span>
            <span v-else class="loading-spinner"></span>
          </button>
          <button @click="showConfirm = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
    
    <div v-if="buildStatus" class="build-status">
      <div class="status-message" :class="buildStatus.status">
        {{ buildStatusMessage }}
      </div>
      <div v-if="buildStatus.queuePosition" class="queue-info">
        Queue position: {{ buildStatus.queuePosition }} / {{ buildStatus.queueLength }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

export default {
  name: 'BuildNowButton',
  
  props: {
    appId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: 'Build Now'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showStatus: {
      type: Boolean,
      default: true
    },
    autoRefresh: {
      type: Boolean,
      default: true
    },
    refreshInterval: {
      type: Number,
      default: 5000 // 5 seconds
    }
  },
  
  emits: ['build-started', 'build-completed', 'build-failed', 'status-update'],
  
  setup(props, { emit }) {
    const loading = ref(false);
    const showConfirm = ref(false);
    const buildPriority = ref('normal');
    const buildStatus = ref(null);
    let statusTimer = null;
    
    // Compute status message
    const buildStatusMessage = computed(() => {
      if (!buildStatus.value) return '';
      
      switch(buildStatus.value.status) {
        case 'queued':
          return 'Build queued, waiting to start...';
        case 'in-progress':
          return 'Build in progress...';
        case 'completed':
          return 'Build completed successfully';
        case 'error':
          return `Build failed: ${buildStatus.value.queueData?.error || 'Unknown error'}`;
        default:
          return `Status: ${buildStatus.value.status}`;
      }
    });
    
    // Build now function
    const buildNow = async () => {
      try {
        loading.value = true;
        showConfirm.value = false;
        
        const response = await axios.post(`/api/builds/build-now/${props.appId}`, {
          priority: buildPriority.value
        });
        
        emit('build-started', response.data);
        
        // Start checking status if auto-refresh is on
        if (props.autoRefresh) {
          await checkBuildStatus();
          startStatusRefresh();
        }
      } catch (err) {
        console.error('Error starting build:', err);
        buildStatus.value = {
          status: 'error',
          queueData: {
            error: err.response?.data?.message || err.message || 'Failed to start build'
          }
        };
        emit('build-failed', { error: err.message });
      } finally {
        loading.value = false;
      }
    };
    
    // Check build status
    const checkBuildStatus = async () => {
      try {
        const response = await axios.get(`/api/builds/status/${props.appId}`);
        buildStatus.value = response.data;
        emit('status-update', response.data);
        
        // If build is complete or failed, stop checking
        if (['completed', 'error'].includes(response.data.status)) {
          stopStatusRefresh();
          
          if (response.data.status === 'completed') {
            emit('build-completed', response.data);
          } else if (response.data.status === 'error') {
            emit('build-failed', response.data);
          }
        }
      } catch (err) {
        console.error('Error checking build status:', err);
      }
    };
    
    // Start periodic status refresh
    const startStatusRefresh = () => {
      if (statusTimer) return;
      
      statusTimer = setInterval(() => {
        checkBuildStatus();
      }, props.refreshInterval);
    };
    
    // Stop periodic status refresh
    const stopStatusRefresh = () => {
      if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
      }
    };
    
    // Check status initially
    onMounted(async () => {
      if (props.showStatus) {
        await checkBuildStatus();
        
        // If build is in progress, start refreshing
        if (buildStatus.value && ['queued', 'in-progress'].includes(buildStatus.value.status)) {
          startStatusRefresh();
        }
      }
    });
    
    // Clean up timer
    onUnmounted(() => {
      stopStatusRefresh();
    });
    
    return {
      loading,
      showConfirm,
      buildPriority,
      buildStatus,
      buildStatusMessage,
      buildNow
    };
  }
}
</script>

<style scoped>
@import '../assets/styles/components/buildNowButton.css';
</style>
