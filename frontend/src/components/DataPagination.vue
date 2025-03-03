<template>
  <div class="pagination">
    <div class="per-page">
      <select v-model="localPerPage" @change="updatePagination">
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }} per page
        </option>
      </select>
    </div>

    <div class="controls">
      <button 
        @click="updatePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn-secondary"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button 
        @click="updatePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn-secondary"
      >
        Next
      </button>
    </div>

    <div class="total">
      Total: {{ total }} items
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:pagination']);

const pageSizes = [10, 20, 50, 100];
const localPerPage = ref(props.perPage);

const totalPages = computed(() => 
  Math.max(1, Math.ceil(props.total / localPerPage.value))
);

function updatePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;
  
  emit('update:pagination', {
    page: newPage,
    perPage: localPerPage.value
  });
}

function updatePagination() {
  emit('update:pagination', {
    page: 1,
    perPage: localPerPage.value
  });
}

watch(() => props.perPage, (newVal) => {
  localPerPage.value = newVal;
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  min-width: 150px;
  text-align: center;
}

select {
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  background-color: white;
  cursor: pointer;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
