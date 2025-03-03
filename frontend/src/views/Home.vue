<template>
  <div class="home">
    <!-- Existing content -->
    
    <div class="debug-links">
      <h3>Developer Tools</h3>
      <router-link to="/test-editor" class="debug-link">Test Template Editor</router-link>
    </div>
  </div>
</template>

<style scoped>
/* Existing styles */

.debug-links {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 8px;
  border: 1px dashed #64748b;
}

.debug-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #818cf8;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.debug-link:hover {
  background-color: #6366f1;
}
</style>
