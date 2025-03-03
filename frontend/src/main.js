import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Keep importing from original location

// Import the debug utilities
import { checkRoutes, addMissingRoute } from './debug-router';

// Import global styles if they exist
try {
  import('./assets/main.css')
    .catch(err => {
      console.log('Global CSS not found, continuing without it');
    });
} catch (e) {
  // Fallback
  console.log('Global CSS import error handled');
}

// Create the Vue app
const app = createApp(App);

app.use(createPinia());
app.use(router);

// Debug: Check registered routes
checkRoutes(router);

// Manually add the missing route if needed
import PromptLibrary from './views/PromptLibrary.vue';
addMissingRoute(router, '/prompt-library', PromptLibrary);

// Debug: Check routes again after manual addition
checkRoutes(router);

// Mount the app
app.mount('#app');
