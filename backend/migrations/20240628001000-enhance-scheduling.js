/**
 * Migration: Enhance App Scheduling with Precise Time
 */
module.exports = {
  async up(db) {
    const collection = db.collection('applications');
    
    // Get all applications with scheduled dates
    const apps = await collection.find({ scheduled: { $ne: null } }).toArray();
    
    // Update each app with the new scheduling structure
    for (const app of apps) {
      if (!app.scheduled) continue;
      
      await collection.updateOne(
        { _id: app._id },
        {
          $set: {
            scheduling: {
              scheduledDateTime: app.scheduled,
              priority: 'medium',
              repeat: false,
              repeatFrequency: 'daily',
              repeatInterval: 1,
              status: 'pending',
              nextRun: app.scheduled
            }
          }
        }
      );
    }
    
    console.log(`Updated ${apps.length} applications with enhanced scheduling`);
  },
  
  async down(db) {
    // No need to revert - the old 'scheduled' field is still maintained
    const collection = db.collection('applications');
    
    await collection.updateMany(
      { scheduling: { $exists: true } },
      { $unset: { scheduling: "" } }
    );
    
    console.log('Reverted enhanced scheduling for all applications');
  }
};
