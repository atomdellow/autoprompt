import { createRouter, createWebHistory } from 'vue';

// Define your routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/generator',
    name: 'generator',
    component: () => import('./views/PromptGenerator.vue')
  },
  {
    path: '/apps',
    name: 'apps',
    component: () => import('./views/Apps.vue')
  },
  {
    path: '/prompt-library',
    name: 'promptLibrary',
    component: () => import('./views/PromptLibrary.vue')
  },
  {
    path: '/test-editor',
    name: 'testEditor',
    component: () => import('./components/TestTemplateEditor.vue')
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Add debug logging
router.beforeEach((to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`);
  next();
});

// Export the router
export default router;
