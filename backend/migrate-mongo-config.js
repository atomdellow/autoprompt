// Simple, direct configuration
module.exports = {
  mongodb: {
    url: "mongodb://127.0.0.1:27017",
    databaseName: "autoprompt",

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog"
};
