<template>
  <div id="app">
    <toast-notifications />
    <header>
      <nav class="nav">
        <router-link to="/">Template Editor</router-link>
        <router-link to="/generator">Prompt Generator</router-link>
        <router-link to="/prompt-library">Prompt Library</router-link>
        <router-link to="/apps">App Manager</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import ToastNotifications from './components/ToastNotifications.vue';

export default {
  name: 'App',
  components: {
    ToastNotifications
  }
}
</script>

<style>
/* Global styles */
@import './assets/styles/main.css';

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.nav a {
  text-decoration: none;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.nav a:hover {
  background-color: #f1f5f9;
}

.nav a.router-link-active {
  background-color: #e2e8f0;
  color: #1e293b;
}

.main {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
