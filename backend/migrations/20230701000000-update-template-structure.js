/**
 * Migration to update existing templates to use the new structure
 */
module.exports = {
  async up(db) {
    // Get all existing templates
    const templates = await db.collection('templates').find({}).toArray();
    
    for (const template of templates) {
      // Create the new structure
      const updatedTemplate = {
        technologies: {
          languages: template.languages || [],
          frameworks: template.frameworks || [],
          databases: template.databases || [],
          frontend: template.frontend || [],
          backend: template.backend || [],
          testing: template.testing || [],
          devops: template.devops || []
        },
        bestPractices: {
          designPatterns: template.designPatterns || [],
          principles: template.principles || []
        }
      };
      
      // Update the document
      await db.collection('templates').updateOne(
        { _id: template._id },
        { $set: updatedTemplate }
      );
      
      // Remove old fields
      await db.collection('templates').updateOne(
        { _id: template._id },
        { $unset: {
          languages: "",
          frameworks: "",
          databases: "",
          frontend: "",
          backend: "",
          testing: "",
          devops: "",
          designPatterns: "",
          principles: ""
        }}
      );
    }
  },

  async down(db) {
    // Get all templates with the new structure
    const templates = await db.collection('templates').find({
      technologies: { $exists: true },
      bestPractices: { $exists: true }
    }).toArray();
    
    for (const template of templates) {
      // Move fields back to top level
      const flat = {
        languages: template.technologies?.languages || [],
        frameworks: template.technologies?.frameworks || [],
        databases: template.technologies?.databases || [],
        frontend: template.technologies?.frontend || [],
        backend: template.technologies?.backend || [],
        testing: template.technologies?.testing || [],
        devops: template.technologies?.devops || [],
        designPatterns: template.bestPractices?.designPatterns || [],
        principles: template.bestPractices?.principles || []
      };
      
      // Update the document
      await db.collection('templates').updateOne(
        { _id: template._id },
        { $set: flat }
      );
      
      // Remove the nested structure
      await db.collection('templates').updateOne(
        { _id: template._id },
        { $unset: {
          technologies: "",
          bestPractices: ""
        }}
      );
    }
  }
};
