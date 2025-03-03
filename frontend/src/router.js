import { createRouter, createWebHistory } from 'vue-router';
import TemplateEditor from './views/TemplateEditor.vue';
import PromptGenerator from './views/PromptGenerator.vue';
import AppManager from './views/AppManager.vue';

const routes = [
  {
    path: '/',
    name: 'TemplateEditor',
    component: TemplateEditor
  },
  {
    path: '/generator',
    name: 'PromptGenerator',
    component: PromptGenerator
  },
  {
    path: '/apps',
    name: 'AppManager',
    component: AppManager
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
