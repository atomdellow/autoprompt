<template>
  <div class="app-detail" v-if="app">
    <div class="app-header">
      <h2>{{ app.title }}</h2>
      <div class="status-badge" :class="app.status">{{ app.status }}</div>
    </div>
    
    <div class="action-buttons">
      <build-now-button 
        :app-id="app._id"
        text="Build Now"
        @build-started="onBuildStarted"
        @build-completed="onBuildCompleted"
        @build-failed="onBuildFailed"
      />
      
      <button @click="showScheduleDialog = true" class="btn btn-secondary">
        Schedule Build
      </button>
    </div>
    
    <div class="detail-section">
      <h3>Details</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">Created:</span>
          <span>{{ formatDate(app.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Last Modified:</span>
          <span>{{ formatDate(app.lastModified || app.updatedAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Path:</span>
          <span class="path">{{ app.path }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="app.scheduling?.scheduledDateTime" class="scheduling-info">
      <h3>Scheduled Build</h3>
      <div class="schedule-details">
        <div class="schedule-item">
          <span class="label">Date & Time:</span>
          <span>{{ formatDateTime(app.scheduling.scheduledDateTime) }}</span>
        </div>
        <div class="schedule-item">
          <span class="label">Priority:</span>
          <span>{{ app.scheduling.priority || 'normal' }}</span>
        </div>
        <div class="schedule-item">
          <span class="label">Status:</span>
          <span>{{ app.scheduling.status }}</span>
        </div>
        <div v-if="app.scheduling.repeat" class="schedule-item">
          <span class="label">Repeats:</span>
          <span>Every {{ app.scheduling.repeatInterval }} {{ app.scheduling.repeatFrequency }}</span>
        </div>
        <div v-if="app.scheduling.nextRun" class="schedule-item">
          <span class="label">Next Run:</span>
          <span>{{ formatDateTime(app.scheduling.nextRun) }}</span>
        </div>
        
        <button @click="cancelSchedule" class="btn btn-danger btn-sm">
          Cancel Schedule
        </button>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Build History</h3>
      <build-history-list :app-id="app._id" />
    </div>

    <!-- Schedule Build Dialog -->
    <schedule-build-dialog
      v-if="showScheduleDialog"
      :app-id="app._id"
      :initial-date-time="app.scheduling?.scheduledDateTime"
      @close="showScheduleDialog = false"
      @scheduled="onScheduleCreated"
    />
  </div>
</template>

<script>
import BuildNowButton from './BuildNowButton.vue';
import BuildHistoryList from './BuildHistoryList.vue';
import ScheduleBuildDialog from './ScheduleBuildDialog.vue';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { useToast } from '../composables/useToast';

export default {
  name: 'AppDetail',
  components: {
    BuildNowButton,
    BuildHistoryList,
    ScheduleBuildDialog
  },
  props: {
    app: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showScheduleDialog: false
    };
  },
  methods: {
    formatDate,
    formatDateTime,
    async cancelSchedule() {
      try {
        const response = await fetch(`/api/apps/${this.app._id}/cancel-schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to cancel schedule');
        }
        
        useToast().showSuccess('Schedule cancelled successfully');
        this.$emit('refresh');
      } catch (error) {
        console.error('Error cancelling schedule:', error);
        useToast().showError('Failed to cancel schedule');
      }
    },
    onBuildStarted() {
      useToast().showInfo(`Build started for ${this.app.title}`);
      this.$emit('refresh');
    },
    onBuildCompleted() {
      useToast().showSuccess(`Build completed successfully for ${this.app.title}`);
      this.$emit('refresh');
    },
    onBuildFailed(error) {
      useToast().showError(`Build failed: ${error}`);
      this.$emit('refresh');
    },
    onScheduleCreated() {
      this.showScheduleDialog = false;
      useToast().showSuccess('Build scheduled successfully');
      this.$emit('refresh');
    }
  }
}
</script>

<style scoped>
@import '../assets/styles/components/appDetail.css';
</style>