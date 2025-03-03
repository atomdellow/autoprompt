<template>
  <div class="tag-input">
    <div class="tag-container">
      <div v-for="(tag, index) in modelValue" :key="index" class="tag">
        {{ tag }}
        <span class="tag-remove" @click="removeTag(index)">&times;</span>
      </div>
    </div>
    <div class="input-container">
      <input
        ref="input"
        type="text"
        :placeholder="placeholder"
        v-model="inputValue"
        @keydown="handleKeyDown"
        @input="isActive = true"
        @focus="isActive = true"
        @blur="isActive = false"
      />
      <div v-if="isActive && filteredSuggestions.length > 0" class="suggestions">
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          class="suggestion-item"
          @mousedown.prevent="selectSuggestion(suggestion)"
          :class="{ active: suggestion === activeSuggestion }"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'TagInput',
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Add...'
    },
    suggestions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  
  data() {
    return {
      inputValue: '',
      isActive: false
    }
  },
  
  methods: {
    addTag() {
      const tag = this.inputValue.trim();
      if (tag && !this.modelValue.includes(tag)) {
        // Create a new array to ensure reactivity
        const newValue = [...this.modelValue, tag];
        this.$emit('update:modelValue', newValue);
        
        // Log to verify tag is added
        console.log(`Added tag "${tag}" to array, now:`, newValue);
      }
      this.inputValue = '';
    },
    
    removeTag(index) {
      // Create a new array to ensure reactivity
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit('update:modelValue', newValue);
      
      // Log to verify tag is removed
      console.log(`Removed tag at index ${index}, now:`, newValue);
    },
    
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.addTag();
      } else if (event.key === 'Backspace' && !this.inputValue && this.modelValue.length > 0) {
        this.removeTag(this.modelValue.length - 1);
      }
    }
  }
}
</script>

<style scoped>
.tag-input {
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 0.25rem;
  background-color: white;
  min-height: 40px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background-color: #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 0.125rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.tag-remove {
  margin-left: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.tag-remove:hover {
  color: #e53e3e;
}

.input-container {
  flex: 1;
  position: relative;
}

input {
  width: 100%;
  border: none;
  outline: none;
  padding: 0.5rem;
  font-size: 1rem;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 0.5rem;
  cursor: pointer;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f0f5ff;
}
</style>
