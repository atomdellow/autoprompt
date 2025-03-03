/**
 * This script injects a route directly into the Vue Router instance without
 * relying on the configuration file. This bypasses any caching issues.
 */

// Run this code in the browser console
(function() {
  // Check if Vue and Vue Router are loaded
  if (!window.Vue || !window.VueRouter) {
    console.error('Vue and/or Vue Router not found on window object');
    return;
  }
  
  // Get the router instance
  const app = document.querySelector('#app').__vue_app__;
  if (!app) {
    console.error('Vue app instance not found');
    return;
  }
  
  const router = app._context.provides.router;
  if (!router) {
    console.error('Router instance not found');
    return;
  }
  
  // Log current routes
  console.log('Current routes:', router.getRoutes().map(r => r.path));
  
  // Add the /prompt-library route
  try {
    router.addRoute({
      path: '/prompt-library',
      name: 'promptLibrary',
      component: {
        template: `
          <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
            <h1>Prompt Library</h1>
            <p>This route was dynamically added.</p>
            <button @click="$router.push('/')">Go Home</button>
          </div>
        `
      }
    });
    
    console.log('Route added successfully');
    console.log('Updated routes:', router.getRoutes().map(r => r.path));
    
    // Prompt to navigate to the new route
    console.log('Navigate to the new route with: router.push("/prompt-library")');
  } catch (err) {
    console.error('Failed to add route:', err);
  }
})();
