<template>
  <div class="template-editor">
    <!-- PROMINENT MOCK BUTTON - Moved outside any container to ensure visibility -->
    <div class="mock-data-banner">
      <button type="button" @click="fillWithMockData" class="btn-mock-prominent">
        👉 FILL WITH MOCK DATA 👈
      </button>
    </div>
    
    <form @submit.prevent="saveTemplate">
      <div class="form-group">
        <label for="template-name">Template Name</label>
        <input 
          id="template-name" 
          v-model="template.name" 
          type="text" 
          required
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="template-description">Description</label>
        <textarea 
          id="template-description" 
          v-model="template.description"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="template-structure">Prompt Structure</label>
        <textarea 
          id="template-structure" 
          v-model="template.structure"
          class="form-control template-structure"
          rows="10"
          placeholder="Create a {languages} application using {frameworks}..."
        ></textarea>
        <small class="form-text text-muted">
          Use placeholders like {languages}, {frameworks}, {databases}, etc.
        </small>
      </div>
      
      <h3>Technologies</h3>
      <div class="technologies-section">
        <div class="tech-group">
          <h4>Languages</h4>
          <TagInput 
            v-model="template.technologies.languages" 
            placeholder="Add languages..."
            :suggestions="languageSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>Frameworks</h4>
          <TagInput 
            v-model="template.technologies.frameworks" 
            placeholder="Add frameworks..."
            :suggestions="frameworkSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>Databases</h4>
          <TagInput 
            v-model="template.technologies.databases" 
            placeholder="Add databases..."
            :suggestions="databaseSuggestions"
          />
        </div>
      </div>
      
      <h3>Best Practices</h3>
      <div class="best-practices-section">
        <div class="tech-group">
          <h4>Design Patterns</h4>
          <TagInput 
            v-model="template.bestPractices.designPatterns" 
            placeholder="Add design patterns..."
            :suggestions="designPatternSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>Principles</h4>
          <TagInput 
            v-model="template.bestPractices.principles" 
            placeholder="Add principles..."
            :suggestions="principleSuggestions"
          />
        </div>
      </div>
      
      <h3>More Technologies</h3>
      <div class="more-technologies-section">
        <div class="tech-group">
          <h4>Front-end</h4>
          <TagInput 
            v-model="template.technologies.frontend" 
            placeholder="Add frontend technologies..."
            :suggestions="frontendSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>Back-end</h4>
          <TagInput 
            v-model="template.technologies.backend" 
            placeholder="Add backend technologies..."
            :suggestions="backendSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>Testing</h4>
          <TagInput 
            v-model="template.technologies.testing" 
            placeholder="Add testing tools..."
            :suggestions="testingSuggestions"
          />
        </div>
        
        <div class="tech-group">
          <h4>DevOps</h4>
          <TagInput 
            v-model="template.technologies.devops" 
            placeholder="Add DevOps tools..."
            :suggestions="devopsSuggestions"
          />
        </div>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">
          {{ editing ? 'Update Template' : 'Save Template' }}
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="resetForm">
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import TagInput from './TagInput.vue';

export default {
  name: 'TemplateEditor',
  components: {
    TagInput
  },
  props: {
    initialTemplate: {
      type: Object,
      default: () => ({})
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'update'],
  
  setup(props, { emit }) {
    // Simple reactive template object
    const template = reactive({
      name: '',
      description: '',
      structure: '',
      technologies: {
        languages: [],
        frameworks: [],
        databases: [],
        frontend: [],
        backend: [],
        testing: [],
        devops: []
      },
      bestPractices: {
        designPatterns: [],
        principles: []
      }
    });
    
    // Keep the existing suggestion arrays
    const languageSuggestions = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust', 'Ruby'
    ];
    
    const frameworkSuggestions = [
      'React', 'Angular', 'Vue', 'Express', 'Django', 'Spring', 'ASP.NET', 'Laravel', 'Next.js', 'Svelte'
    ];
    
    const databaseSuggestions = [
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Cassandra', 'DynamoDB', 'Firestore'
    ];
    
    const designPatternSuggestions = [
      'Singleton', 'Factory', 'Observer', 'Strategy', 'MVC', 'Repository', 'Dependency Injection', 'Command'
    ];
    
    const principleSuggestions = [
      'SOLID', 'DRY', 'KISS', 'YAGNI', 'Separation of Concerns', 'Composition over Inheritance'
    ];
    
    const frontendSuggestions = [
      'HTML5', 'CSS3', 'Sass/SCSS', 'TailwindCSS', 'Bootstrap', 'Redux', 'Vuex', 'GraphQL'
    ];
    
    const backendSuggestions = [
      'Node.js', 'FastAPI', 'Flask', '.NET', 'Spring Boot', 'Ruby on Rails', 'Kafka', 'gRPC', 'WebSockets'
    ];
    
    const testingSuggestions = [
      'Jest', 'Mocha', 'Cypress', 'Selenium', 'PyTest', 'JUnit', 'TestNG', 'Vitest'
    ];
    
    const devopsSuggestions = [
      'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Travis CI', 'CircleCI', 'AWS', 'Azure', 'Terraform'
    ];
    
    // Load the initial values on mount
    onMounted(() => {
      if (props.initialTemplate && Object.keys(props.initialTemplate).length > 0) {
        // Basic properties
        template.name = props.initialTemplate.name || '';
        template.description = props.initialTemplate.description || '';
        template.structure = props.initialTemplate.structure || '';
        
        // Technologies
        if (props.initialTemplate.technologies) {
          // Clear existing arrays first
          template.technologies.languages = [];
          template.technologies.frameworks = [];
          template.technologies.databases = [];
          template.technologies.frontend = [];
          template.technologies.backend = [];
          template.technologies.testing = [];
          template.technologies.devops = [];
          
          // Add items one by one to avoid reactivity issues
          if (Array.isArray(props.initialTemplate.technologies.languages)) {
            props.initialTemplate.technologies.languages.forEach(item => 
              template.technologies.languages.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.frameworks)) {
            props.initialTemplate.technologies.frameworks.forEach(item => 
              template.technologies.frameworks.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.databases)) {
            props.initialTemplate.technologies.databases.forEach(item => 
              template.technologies.databases.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.frontend)) {
            props.initialTemplate.technologies.frontend.forEach(item => 
              template.technologies.frontend.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.backend)) {
            props.initialTemplate.technologies.backend.forEach(item => 
              template.technologies.backend.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.testing)) {
            props.initialTemplate.technologies.testing.forEach(item => 
              template.technologies.testing.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.technologies.devops)) {
            props.initialTemplate.technologies.devops.forEach(item => 
              template.technologies.devops.push(item));
          }
        }
        
        // Best practices
        if (props.initialTemplate.bestPractices) {
          template.bestPractices.designPatterns = [];
          template.bestPractices.principles = [];
          
          if (Array.isArray(props.initialTemplate.bestPractices.designPatterns)) {
            props.initialTemplate.bestPractices.designPatterns.forEach(item => 
              template.bestPractices.designPatterns.push(item));
          }
          
          if (Array.isArray(props.initialTemplate.bestPractices.principles)) {
            props.initialTemplate.bestPractices.principles.forEach(item => 
              template.bestPractices.principles.push(item));
          }
        }
      }
    });
    
    // Super simple save function that uses plain object
    function saveTemplate() {
      // Create a non-reactive plain object to send
      const plainObj = {
        name: template.name,
        description: template.description,
        structure: template.structure,
        technologies: {
          languages: [...template.technologies.languages],
          frameworks: [...template.technologies.frameworks],
          databases: [...template.technologies.databases],
          frontend: [...template.technologies.frontend],
          backend: [...template.technologies.backend],
          testing: [...template.technologies.testing],
          devops: [...template.technologies.devops]
        },
        bestPractices: {
          designPatterns: [...template.bestPractices.designPatterns],
          principles: [...template.bestPractices.principles]
        }
      };
      
      // Add ID if we're editing
      if (props.editing && props.initialTemplate._id) {
        plainObj._id = props.initialTemplate._id;
      }
      
      // Using global window to break out of Vue reactivity
      window.setTimeout(() => {
        if (props.editing) {
          emit('update', plainObj);
        } else {
          emit('save', plainObj);
        }
      }, 0);
    }
    
    // Reset form
    function resetForm() {
      template.name = '';
      template.description = '';
      template.structure = '';
      
      // Reset arrays
      template.technologies.languages.length = 0;
      template.technologies.frameworks.length = 0;
      template.technologies.databases.length = 0;
      template.technologies.frontend.length = 0;
      template.technologies.backend.length = 0;
      template.technologies.testing.length = 0;
      template.technologies.devops.length = 0;
      template.bestPractices.designPatterns.length = 0;
      template.bestPractices.principles.length = 0;
      
      // If editing, reload the initial values
      if (props.editing && props.initialTemplate) {
        template.name = props.initialTemplate.name || '';
        template.description = props.initialTemplate.description || '';
        template.structure = props.initialTemplate.structure || '';
        
        // Reload technologies and best practices...
        // Similar to what we did in onMounted
        if (props.initialTemplate.technologies) {
          // Add items one by one
          if (Array.isArray(props.initialTemplate.technologies.languages)) {
            props.initialTemplate.technologies.languages.forEach(item => 
              template.technologies.languages.push(item));
          }
          
          // ...same for other technology arrays...
        }
        
        // ...same for best practices...
      }
    }
    
    // Template mock data function
    const fillWithMockData = () => {
      // Clear existing data first
      template.name = '';
      template.description = '';
      template.structure = '';
      
      template.technologies.languages = [];
      template.technologies.frameworks = [];
      template.technologies.databases = [];
      template.technologies.frontend = [];
      template.technologies.backend = [];
      template.technologies.testing = [];
      template.technologies.devops = [];
      
      template.bestPractices.designPatterns = [];
      template.bestPractices.principles = [];
      
      // Set mock data
      template.name = 'Full Stack Web Application';
      template.description = 'A comprehensive template for modern web applications';
      
      template.structure = `Create a {languages} application using {frameworks} for the frontend
and {databases} for data storage.

Requirements:
1. Implement user authentication with JWT
2. Create a responsive dashboard UI 
3. Use {designPatterns} design patterns
4. Follow best practices including {principles}
5. Implement API endpoints for CRUD operations
6. Add comprehensive unit tests and integration tests

The application should use {frontend} for UI components, {backend} for server implementation, 
{testing} for test automation, and {devops} for CI/CD pipelines.`;
      
      // Add languages
      ['JavaScript', 'TypeScript', 'HTML', 'CSS'].forEach(lang => {
        template.technologies.languages.push(lang);
      });
      
      // Add frameworks
      ['React', 'Express'].forEach(framework => {
        template.technologies.frameworks.push(framework);
      });
      
      // Add databases
      ['MongoDB', 'Redis'].forEach(db => {
        template.technologies.databases.push(db);
      });
      
      // Add design patterns
      ['MVC', 'Repository', 'Factory'].forEach(pattern => {
        template.bestPractices.designPatterns.push(pattern);
      });
      
      // Add principles
      ['SOLID', 'DRY', 'KISS'].forEach(principle => {
        template.bestPractices.principles.push(principle);
      });
      
      // Add frontend technologies
      ['React Router', 'Redux', 'Tailwind CSS'].forEach(tech => {
        template.technologies.frontend.push(tech);
      });
      
      // Add backend technologies
      ['Node.js', 'Express', 'Mongoose'].forEach(tech => {
        template.technologies.backend.push(tech);
      });
      
      // Add testing technologies
      ['Jest', 'React Testing Library', 'Supertest'].forEach(tech => {
        template.technologies.testing.push(tech);
      });
      
      // Add devops technologies
      ['Docker', 'GitHub Actions', 'AWS'].forEach(tech => {
        template.technologies.devops.push(tech);
      });
      
      alert('Form filled with mock data!');
    };

    return {
      template,
      saveTemplate,
      resetForm,
      fillWithMockData, // Add this to the returned object
      languageSuggestions,
      frameworkSuggestions,
      databaseSuggestions,
      designPatternSuggestions,
      principleSuggestions,
      frontendSuggestions,
      backendSuggestions,
      testingSuggestions,
      devopsSuggestions
    };
  }
};
</script>

<style scoped>
.template-editor {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.template-structure {
  font-family: monospace;
}

.technologies-section,
.best-practices-section,
.more-technologies-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tech-group {
  margin-bottom: 1rem;
}

.tech-group h4 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
  border: none;
}

.btn-outline-secondary {
  background-color: white;
  color: #718096;
  border: 1px solid #cbd5e0;
  margin-left: 0.5rem;
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

/* Add these new prominent styles */
.mock-data-banner {
  background-color: #3730a3; /* Indigo 800 */
  padding: 16px;
  margin: -1rem -1rem 1rem -1rem;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.btn-mock-prominent {
  background-color: #fbbf24; /* Amber 400 */
  color: #000;
  font-weight: bold;
  font-size: 1rem;
  padding: 12px 24px;
  border: 2px solid #f59e0b; /* Amber 500 */
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
  transition: all 0.2s ease;
}

.btn-mock-prominent:hover {
  background-color: #f59e0b; /* Amber 500 */
  transform: scale(1.05);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* ...existing styles... */
</style>
