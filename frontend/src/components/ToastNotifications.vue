<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast"
        :class="[toast.show ? 'show' : 'hide', toast.type]"
        @click="dismissToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <i v-if="toast.type === 'success'" class="fas fa-check-circle"></i>
            <i v-else-if="toast.type === 'error'" class="fas fa-exclamation-circle"></i>
            <i v-else-if="toast.type === 'warning'" class="fas fa-exclamation-triangle"></i>
            <i v-else class="fas fa-info-circle"></i>
          </div>
          <div class="toast-message">
            {{ toast.message }}
          </div>
          <button class="toast-close" @click.stop="dismissToast(toast.id)">&times;</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useToast } from '../composables/useToast';

export default {
  name: 'ToastNotifications',
  setup() {
    const { toasts, dismissToast } = useToast();
    
    return {
      toasts,
      dismissToast
    };
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
}

.toast {
  background-color: white;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(50px);
  cursor: pointer;
}

.toast.show {
  opacity: 1;
  transform: translateX(0);
}

.toast.hide {
  opacity: 0;
  transform: translateX(50px);
}

.toast-content {
  display: flex;
  align-items: center;
}

.toast-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.toast-message {
  flex-grow: 1;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.toast.success {
  border-left: 4px solid #4caf50;
}

.toast.success .toast-icon {
  color: #4caf50;
}

.toast.error {
  border-left: 4px solid #f44336;
}

.toast.error .toast-icon {
  color: #f44336;
}

.toast.info {
  border-left: 4px solid #2196f3;
}

.toast.info .toast-icon {
  color: #2196f3;
}

.toast.warning {
  border-left: 4px solid #ff9800;
}

.toast.warning .toast-icon {
  color: #ff9800;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
