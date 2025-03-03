module.exports = {
  async up(db) {
    const templates = await db.collection('templates').find({}).toArray();
    
    for (const template of templates) {
      // Convert old format to new format
      const technologies = {
        frontend: [],
        backend: [],
        database: [],
        devops: [],
        testing: []
      };

      // Convert existing technologies to new structure
      if (template.frameworks) {
        template.frameworks.forEach(framework => {
          if (['Vue', 'React', 'Angular'].includes(framework)) {
            technologies.frontend.push({
              name: framework,
              category: 'frontend',
              type: 'framework'
            });
          } else if (['Express', 'Node.js', '.NET'].includes(framework)) {
            technologies.backend.push({
              name: framework,
              category: 'backend',
              type: 'framework'
            });
          }
        });
      }

      if (template.databases) {
        template.databases.forEach(db => {
          technologies.database.push({
            name: db,
            category: 'database',
            type: 'database'
          });
        });
      }

      // Update the document
      await db.collection('templates').updateOne(
        { _id: template._id },
        {
          $set: {
            technologies,
            updatedAt: new Date()
          },
          $unset: {
            frameworks: "",
            databases: ""
          }
        }
      );
    }
  },

  async down(db) {
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
  }
};
