<template>
  <div class="technology-selector">
    <div class="categories">
      <div v-for="category in categories" :key="category" class="category">
        <h3>{{ formatCategory(category) }}</h3>
        <div class="tech-list">
          <div v-for="tech in getTechByCategory(category)" :key="tech._id" class="tech-item">
            <div class="tech-header">
              <label :for="tech.name">{{ tech.name }}</label>
              <div class="tech-controls">
                <select 
                  v-model="selectedVersions[tech.name]"
                  :id="tech.name"
                  @change="updateTechnology(tech, $event)"
                >
                  <option value="">Select Version</option>
                  <option value="latest">Latest ({{ tech.latestVersion }})</option>
                  <option v-for="version in tech.versions" 
                          :key="version.version" 
                          :value="version.version">
                    {{ version.version }} {{ version.isLTS ? '(LTS)' : '' }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="selected-techs">
      <h3>Selected Technologies</h3>
      <div class="selected-list">
        <div v-for="(version, name) in selectedVersions" 
             :key="name" 
             v-if="version" 
             class="selected-item">
          {{ name }} ({{ version }})
          <button @click="removeTechnology(name)" class="remove-btn">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTechnologyStore } from '../stores/technology';

const techStore = useTechnologyStore();
const { technologies } = storeToRefs(techStore);

const selectedVersions = ref({});
const categories = ['frontend', 'backend', 'database', 'devops', 'testing'];

const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const getTechByCategory = (category) => {
  return technologies.value.filter(tech => tech.category === category);
};

const updateTechnology = (tech, event) => {
  const version = event.target.value;
  if (version) {
    selectedVersions.value[tech.name] = version;
  } else {
    delete selectedVersions.value[tech.name];
  }
  emit('update:selected', Object.entries(selectedVersions.value)
    .map(([name, version]) => ({ name, version })));
};

const removeTechnology = (name) => {
  delete selectedVersions.value[name];
  emit('update:selected', Object.entries(selectedVersions.value)
    .map(([name, version]) => ({ name, version })));
};

const emit = defineEmits(['update:selected']);
</script>

<style scoped>
.technology-selector {
  padding: 1rem;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1rem;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tech-item {
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
}

.tech-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-controls {
  display: flex;
  gap: 0.5rem;
}

.selected-techs {
  margin-top: 2rem;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-item {
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn {
  border: none;
  background: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.25rem;
}
</style>
