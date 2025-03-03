import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

// Create and export the router directly - this is a clean approach
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/generator',
      name: 'generator',
      component: () => import('../views/PromptGenerator.vue')
    },
    // DO NOT REPLACE your entire router file. 
    // Just find where the "App Manager" route is defined and comment it here:
    /*
    Route structure for App Manager looks like:
    {
      path: '/apps',  // or whatever the path is for your App Manager
      name: 'apps',   // the name might be different
      component: () => import('../path/to/AppManager.vue')
    }
    */
    {
      path: '/apps',
      name: 'apps',
      component: () => import('../views/Apps.vue')
    },
    // Make sure our new route is properly defined
    {
      path: '/prompt-library',
      name: 'promptLibrary',
      component: () => import('../views/PromptLibrary.vue')
    },
    {
      path: '/test-editor',
      name: 'testEditor',
      component: () => import('../components/TestTemplateEditor.vue')
    }
  ]
});

// Export the router instance
export default router;
