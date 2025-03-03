<template>
  <div class="sorting">
    <select v-model="localField" @change="updateSort">
      <option value="">Sort by...</option>
      <option 
        v-for="option in sortOptions" 
        :key="option.field" 
        :value="option.field"
      >
        {{ option.label }}
      </option>
    </select>

    <button 
      v-if="localField"
      @click="toggleOrder" 
      class="btn-icon"
      :title="localOrder === 'asc' ? 'Ascending' : 'Descending'"
    >
      <span v-if="localOrder === 'asc'">↑</span>
      <span v-else>↓</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  sortOptions: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(option => option.field && option.label);
    }
  },
  field: String,
  order: {
    type: String,
    default: 'asc'
  }
});

const emit = defineEmits(['update:sort']);

const localField = ref(props.field);
const localOrder = ref(props.order);

function updateSort() {
  emit('update:sort', {
    field: localField.value,
    order: localOrder.value
  });
}

function toggleOrder() {
  localOrder.value = localOrder.value === 'asc' ? 'desc' : 'asc';
  updateSort();
}

watch([() => props.field, () => props.order], ([newField, newOrder]) => {
  localField.value = newField;
  localOrder.value = newOrder;
});
</script>

<style scoped>
.sorting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  min-width: 150px;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.25rem;
}

.btn-icon:hover {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}
</style>
