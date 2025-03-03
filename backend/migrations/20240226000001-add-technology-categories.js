module.exports = {
  async up(db, client) {
    try {
      // Get all templates
      const templates = await db.collection('templates').find({}).toArray();
      
      for (const template of templates) {
        const technologies = {
          frontend: [],
          backend: [],
          database: [],
          devops: [],
          testing: []
        };

        // Convert existing frameworks
        if (template.frameworks) {
          for (const framework of template.frameworks) {
            if (['Vue', 'React', 'Angular'].includes(framework)) {
              technologies.frontend.push({
                name: framework,
                type: 'framework',
                category: 'frontend'
              });
            } else if (['Express', 'Node.js', '.NET'].includes(framework)) {
              technologies.backend.push({
                name: framework,
                type: 'framework',
                category: 'backend'
              });
            }
          }
        }

        // Convert existing databases
        if (template.databases) {
          for (const db of template.databases) {
            technologies.database.push({
              name: db,
              type: 'database',
              category: 'database'
            });
          }
        }

        // Update the document
        await db.collection('templates').updateOne(
          { _id: template._id },
          {
            $set: {
              technologies,
              updatedAt: new Date()
            }
          }
        );
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(db, client) {
    try {
      const templates = await db.collection('templates').find({}).toArray();
      
      for (const template of templates) {
        // Convert back to old format
        const frameworks = [];
        const databases = [];

        if (template.technologies) {
          if (template.technologies.frontend) {
            frameworks.push(...template.technologies.frontend.map(t => t.name));
          }
          if (template.technologies.backend) {
            frameworks.push(...template.technologies.backend.map(t => t.name));
          }
          if (template.technologies.database) {
            databases.push(...template.technologies.database.map(t => t.name));
          }
        }

        await db.collection('templates').updateOne(
          { _id: template._id },
          {
            $set: {
              frameworks,
              databases,
              updatedAt: new Date()
            },
            $unset: {
              technologies: ""
            }
          }
        );
      }
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
