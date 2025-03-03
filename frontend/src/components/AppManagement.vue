<template>
  <div class="app-management">
    <div class="app-header">
      <h2>Application Management</h2>
      <button class="btn-primary" @click="createNewApp">Create New App</button>
    </div>
    
    <div v-if="selectedApp" class="app-details">
      <h3>{{ selectedApp.title }}</h3>
      <div class="app-metadata">
        <div class="metadata-item">
          <span class="label">Created:</span>
          <span>{{ formatDate(selectedApp.createdAt) }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Last Modified:</span>
          <span>{{ formatDate(selectedApp.lastModified || selectedApp.updatedAt) }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Status:</span>
          <span :class="'status ' + selectedApp.status">{{ selectedApp.status }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Path:</span>
          <span class="path">{{ selectedApp.path }}</span>
        </div>
      </div>
      
      <div class="app-structure" v-if="selectedApp.structure">
        <h4>Project Structure</h4>
        <div class="structure-info">
          <div class="structure-item" v-if="selectedApp.structure.hasBackend">
            <span class="label">Backend:</span>
            <span>{{ selectedApp.structure.backendPath }}</span>
            <div class="tech-tags">
              <span class="tech-tag" v-for="tech in selectedApp.structure.backendTech" :key="tech">
                {{ tech }}
              </span>
            </div>
          </div>
          <div class="structure-item" v-if="selectedApp.structure.hasFrontend">
            <span class="label">Frontend:</span>
            <span>{{ selectedApp.structure.frontendPath }}</span>
            <div class="tech-tags">
              <span class="tech-tag" v-for="tech in selectedApp.structure.frontendTech" :key="tech">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="app-actions">
        <div class="action-group">
          <h4>Modify Application</h4>
          <textarea 
            v-model="modifyPrompt" 
            placeholder="Enter instructions to modify the app..."
            class="prompt-input"
          ></textarea>
          <div class="target-selector">
            <label>
              <input type="radio" v-model="modificationTarget" value="both" checked> 
              Both
            </label>
            <label v-if="selectedApp.structure?.hasBackend">
              <input type="radio" v-model="modificationTarget" value="backend"> 
              Backend
            </label>
            <label v-if="selectedApp.structure?.hasFrontend">
              <input type="radio" v-model="modificationTarget" value="frontend"> 
              Frontend
            </label>
          </div>
          <button 
            @click="modifyApp" 
            class="btn-primary"
            :disabled="!modifyPrompt || modifyPrompt.length < 5"
          >
            Modify App
          </button>
        </div>
        
        <div class="action-group">
          <h4>Install Package</h4>
          <div class="package-inputs">
            <input 
              v-model="packageName" 
              placeholder="Package name" 
              class="input-field"
            >
            <input 
              v-model="packageVersion" 
              placeholder="Version (optional)" 
              class="input-field"
            >
          </div>
            <div class="target-selector">
            <label v-if="selectedApp.structure?.hasBackend">
              <input type="radio" v-model="installTarget" value="backend" checked> 
              Backend
            </label>
            <label v-if="selectedApp.structure?.hasFrontend">
              <input type="radio" v-model="installTarget" value="frontend">
              Frontend
            </label>
            </div>
            <button 
            @click="installPackage" 
            class="btn-primary"
            :disabled="!packageName"
            >
            Install Package
            </button>
          </div>
          </div>
        </div>
        </div>
      </template>