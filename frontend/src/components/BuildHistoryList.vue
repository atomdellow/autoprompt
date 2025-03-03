<template>
  <div class="build-history">
    <div v-if="loading" class="loading">Loading history...</div>
    
    <div v-else-if="history.length === 0" class="no-history">
      No build history available
    </div>
    
    <div v-else class="history-list">
      <div 
        v-for="(item, index) in history" 
        :key="index"
        class="history-item"
      >
        <div class="history-item-header">
          <div class="history-item-time">{{ formatDateTime(item.timestamp) }}</div>
          <div class="history-item-status" :class="item.status">{{ item.status }}</div>
        </div>
        
        <div class="history-item-details">
          <div class="history-item-changes" v-if="item.changes && item.changes.length > 0">
            <h4>Changes</h4>
            <ul>
              <li v-for="(change, idx) in item.changes" :key="idx">{{ change }}</li>
            </ul>
          </div>
          
          <div class="history-prompt" v-if="item.prompt">
            <h4>Prompt</h4>
            <div class="prompt-text">{{ truncateText(item.prompt, 150) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { formatDateTime } from '../utils/dateUtils';

export default {
  name: 'BuildHistoryList',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const history = ref([]);
    const loading = ref(true);
    const error = ref(null);
    
    const fetchHistory = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`/api/apps/${props.appId}/history`);
        history.value = response.data.history || [];
        
        // Add the original prompt as first history item
        if (response.data.originalPrompt) {
          history.value.unshift({
            prompt: response.data.originalPrompt,
            timestamp: null, // We don't have timestamp for the original prompt
            status: 'original',
            changes: []
          });
        }
      } catch (err) {
        console.error('Failed to fetch build history:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength 
        ? `${text.substring(0, maxLength)}...` 
        : text;
    };
    
    onMounted(fetchHistory);
    
    return {
      history,
      loading,
      error,
      formatDateTime,
      truncateText
    };
  }
}
</script>

<style scoped>
.build-history {
  margin-top: 10px;
}

.loading, .no-history {
  padding: 20px;
  text-align: center;
  color: #666;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.history-item-time {
  font-weight: 500;
}

.history-item-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
  background-color: #e0e0e0;
}

.history-item-status.completed {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.history-item-status.failed {
  background-color: #ffcdd2;
  color: #c62828;
}

.history-item-status.in-progress {
  background-color: #bbdefb;
  color: #1565c0;
}

.history-item-status.original {
  background-color: #e1f5fe;
  color: #01579b;
}

.history-item-details {
  padding: 15px;
}

.history-item-changes {
  margin-bottom: 10px;
}

.history-item-changes h4,
.history-prompt h4 {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #666;
}

.history-item-changes ul {
  margin: 0;
  padding-left: 20px;
}

.history-item-changes li {
  margin-bottom: 3px;
}

.prompt-text {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
