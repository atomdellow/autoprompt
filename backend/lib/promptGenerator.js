/**
 * Utility for generating prompts from templates
 */
class PromptGenerator {
  /**
   * Generate a prompt from a template and selections
   * @param {Object} template - The template object
   * @param {Object} selections - User's selections for each category
   * @param {string} userPrompt - Additional user requirements
   * @returns {string} Generated prompt
   */
  static generate(template, selections = {}, userPrompt = '') {
    if (!template || !template.structure) {
      throw new Error('Invalid template: structure is required');
    }

    // Start the prompt with template name and description
    let promptText = `# ${template.name}\n\n`;
    
    // Add description if available
    if (template.description && template.description.trim()) {
      promptText += `${template.description}\n\n`;
    }
    
    // Add the main structure
    promptText += template.structure;
    
    // Create a unified set of placeholders from the template data
    const placeholders = {
      // Handle both old and new data structures
      languages: this.getValueToRender('languages', selections, template),
      frameworks: this.getValueToRender('frameworks', selections, template),
      databases: this.getValueToRender('databases', selections, template),
      frontend: this.getValueToRender('frontend', selections, template),
      backend: this.getValueToRender('backend', selections, template),
      testing: this.getValueToRender('testing', selections, template),
      devops: this.getValueToRender('devops', selections, template),
      designPatterns: this.getValueToRender('designPatterns', selections, template),
      principles: this.getValueToRender('principles', selections, template),
      libraries: this.getValueToRender('libraries', selections, template)
    };

    console.log('Generating prompt with placeholders:', placeholders);

    // Replace all placeholders in the template
    Object.entries(placeholders).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const replacement = Array.isArray(value) && value.length > 0 
        ? value.join(', ') 
        : '(none specified)';
      
      // Global case-insensitive replacement
      promptText = promptText.replace(new RegExp(placeholder, 'gi'), replacement);
    });

    // Add user requirements if provided
    if (userPrompt && userPrompt.trim()) {
      promptText += '\n\n## Additional Requirements\n' + userPrompt.trim();
    }

    return promptText;
  }

  /**
   * Get the correct value to render from selections or template
   * @param {string} category - Category name
   * @param {Object} selections - User selections
   * @param {Object} template - Template object
   * @returns {Array} Array of values to render
   */
  static getValueToRender(category, selections, template) {
    // First try to use selections if available
    if (selections[category] && selections[category].length > 0) {
      return selections[category];
    }

    // Then try newer nested structure
    if (category === 'designPatterns' || category === 'principles') {
      if (template.bestPractices && Array.isArray(template.bestPractices[category])) {
        return template.bestPractices[category];
      }
    } else if (template.technologies && Array.isArray(template.technologies[category])) {
      return template.technologies[category];
    }

    // Finally try old flat structure
    if (Array.isArray(template[category])) {
      return template[category];
    }

    // Default to empty array
    return [];
  }
}

module.exports = PromptGenerator;
