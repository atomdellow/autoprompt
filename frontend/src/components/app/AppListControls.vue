<template>
  <div class="list-controls">
    <div class="search-section">
      <DataSorting
        :sort-options="sortOptions"
        :sort="sort"
        @update:sort="$emit('update:sort', $event)"
      />
      
      <div class="search">
        <input 
          v-model="localSearchQuery" 
          placeholder="Search apps..."
          class="search-input"
        >
        <span v-if="localSearchQuery" class="search-status">
          Found {{ total }} result{{ total !== 1 ? 's' : '' }}
          <button 
            v-if="localSearchQuery" 
            @click="clearSearch" 
            class="clear-search"
          >
            Clear
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DataSorting from '../DataSorting.vue';

const props = defineProps({
  sortOptions: {
    type: Array,
    required: true
  },
  sort: {
    type: Object,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:sort', 'update:searchQuery', 'clear-search']);

const localSearchQuery = ref(props.searchQuery);

watch(() => props.searchQuery, (newVal) => {
  localSearchQuery.value = newVal;
});

watch(localSearchQuery, (newVal) => {
  emit('update:searchQuery', newVal);
});

function clearSearch() {
  localSearchQuery.value = '';
  emit('clear-search');
}
</script>

<style scoped>
.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.search {
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 0.75rem;
}

.search-input {
  padding: 0.625rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 300px;
  width: 100%;
  max-width: 500px;
}

.search-status {
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-search {
  padding: 0.25rem 0.5rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: #475569;
}

.clear-search:hover {
  background-color: #cbd5e1;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-input {
    min-width: 100%;
  }
}
</style>
