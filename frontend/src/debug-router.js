/**
 * Router Debug Utility
 * 
 * This file contains utilities to debug router issues
 */

// Function to check if routes are registered
export function checkRoutes(router) {
  console.log('==== ROUTER DEBUG INFO ====');
  console.log('Available routes:');
  
  if (!router || !router.getRoutes) {
    console.error('Invalid router instance');
    return false;
  }
  
  const routes = router.getRoutes();
  console.log(`Found ${routes.length} routes:`);
  
  routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.path} (${route.name || 'unnamed'})`);
  });
  
  // Check if /prompt-library exists
  const promptLibraryRoute = routes.find(r => r.path === '/prompt-library');
  console.log('/prompt-library route exists:', !!promptLibraryRoute);
  
  return true;
}

// Function to manually add a route
export function addMissingRoute(router, path, component) {
  try {
    // Check if route already exists
    const routes = router.getRoutes();
    const exists = routes.some(r => r.path === path);
    
    if (exists) {
      console.log(`Route ${path} already exists`);
      return;
    }
    
    // Add the route
    router.addRoute({
      path,
      component,
      name: path.substring(1) // Use path without leading slash as name
    });
    
    console.log(`Route ${path} added manually`);
    
    // Force router to recognize the new route
    router.push(path);
    router.replace(router.currentRoute.value);
    
  } catch (err) {
    console.error('Error adding route:', err);
  }
}
