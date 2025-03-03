<template>
  <div class="multi-select-container">
    <!-- Display selected items -->
    <div v-if="modelValue.length > 0" class="selected-items">
      <div v-for="(item, index) in modelValue" :key="`${item}-${index}`" class="selected-item">
        {{ item }}
        <button type="button" class="remove-btn" @click="removeItem(item)">×</button>
      </div>
    </div>
    <div v-else class="no-selections">No items selected</div>
    
    <!-- Dropdown to add new items -->
    <div class="select-input-container">
      <select 
        class="select-input"
        ref="selectRef"
        @change="addSelected"
      >
        <option value="">Add more options...</option>
        <option 
          v-for="option in availableOptions" 
          :key="option" 
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'MultiSelect',
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    options: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    const selectRef = ref(null);

    // Compute options that aren't already selected
    const availableOptions = computed(() => {
      return props.options.filter(option => !props.modelValue.includes(option));
    });

    // Add the selected item to the value
    const addSelected = () => {
      const value = selectRef.value.value;
      if (!value) return;
      
      if (props.multiple) {
        // For multiple selection, add to the array if not already included
        if (!props.modelValue.includes(value)) {
          emit('update:modelValue', [...props.modelValue, value]);
        }
      } else {
        // For single selection, replace the value
        emit('update:modelValue', [value]);
      }
      
      // Reset select dropdown
      selectRef.value.value = '';
    };

    // Remove an item from the selection
    const removeItem = (item) => {
      emit('update:modelValue', props.modelValue.filter(i => i !== item));
    };

    return {
      selectRef,
      availableOptions,
      addSelected,
      removeItem
    };
  }
};
</script>

<style scoped>
.multi-select-container {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: white;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  min-height: 32px;
}

.no-selections {
  color: #a0aec0;
  margin-bottom: 0.75rem;
  font-style: italic;
  font-size: 0.9rem;
}

.selected-item {
  background-color: #edf2f7;
  border-radius: 0.25rem;
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  border: 1px solid #cbd5e0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.remove-btn {
  margin-left: 0.5rem;
  color: #718096;
  font-weight: bold;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9px;
}

.remove-btn:hover {
  background-color: #cbd5e0;
  color: #4a5568;
}

.select-input-container {
  width: 100%;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
}
</style>
