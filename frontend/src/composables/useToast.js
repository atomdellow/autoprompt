import { ref, onMounted, onUnmounted } from 'vue';

// Create a shared state for toasts that persists between calls
const toasts = ref([]);
let toastIdCounter = 0;
let clearTimers = {};

export function useToast() {
  onUnmounted(() => {
    // Clear any timers when component unmounts
    Object.values(clearTimers).forEach(timer => clearTimeout(timer));
  });

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info, warning)
   * @param {number} duration - How long to show toast in ms
   */
  const showToast = (message, type = 'info', duration = 5000) => {
    const id = toastIdCounter++;
    
    // Add the toast
    toasts.value.push({
      id,
      message,
      type,
      show: true
    });
    
    // Auto-dismiss after duration
    if (duration > 0) {
      clearTimers[id] = setTimeout(() => {
        dismissToast(id);
        delete clearTimers[id];
      }, duration);
    }
    
    return id;
  };
  
  /**
   * Dismiss a toast by id
   * @param {number} id - Toast ID to dismiss
   */
  const dismissToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      // Mark as hiding first for animation
      toasts.value[index].show = false;
      
      // Then remove after animation completes
      setTimeout(() => {
        toasts.value = toasts.value.filter(toast => toast.id !== id);
      }, 300);
    }
  };
  
  /**
   * Shortcut to show a success toast
   */
  const showSuccess = (message, duration = 5000) => {
    return showToast(message, 'success', duration);
  };
  
  /**
   * Shortcut to show an error toast
   */
  const showError = (message, duration = 8000) => {
    return showToast(message, 'error', duration);
  };
  
  /**
   * Shortcut to show an info toast
   */
  const showInfo = (message, duration = 5000) => {
    return showToast(message, 'info', duration);
  };
  
  /**
   * Shortcut to show a warning toast
   */
  const showWarning = (message, duration = 7000) => {
    return showToast(message, 'warning', duration);
  };
  
  return {
    toasts,
    showToast,
    dismissToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
}
