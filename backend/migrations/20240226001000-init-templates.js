/**
 * Migration: Initialize Templates with Technology Categories
 */
module.exports = {
  async up(db) {
    const collection = db.collection('templates');
    
    // Add new schema fields
    const result = await collection.updateMany(
      {},
      {
        $set: {
          technologies: {
            frontend: [],
            backend: [],
            database: [],
            devops: [],
            testing: []
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} documents`);
    return result;
  },

  async down(db) {
    const collection = db.collection('templates');
    
    // Revert changes
    const result = await collection.updateMany(
      {},
      {
        $unset: {
          technologies: ""
        }
      }
    );

    console.log(`Reverted ${result.modifiedCount} documents`);
    return result;
  }
};
