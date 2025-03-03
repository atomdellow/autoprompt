const technologies = [
  {
    name: 'Vue',
    category: 'frontend',
    type: 'framework',
    versions: [
      { version: '3.4', isLatest: true, releaseDate: new Date('2024-02-20'), isLTS: false },
      { version: '3.3', isLatest: false, releaseDate: new Date('2023-10-20'), isLTS: true },
      { version: '2.7', isLatest: false, releaseDate: new Date('2022-07-01'), isLTS: true }
    ],
    currentStableVersion: '3.4',
    latestVersion: '3.4'
  },
  {
    name: '.NET',
    category: 'backend',
    type: 'framework',
    versions: [
      { version: '8.0', isLatest: true, releaseDate: new Date('2023-11-14'), isLTS: true },
      { version: '7.0', isLatest: false, releaseDate: new Date('2022-11-08'), isLTS: false },
      { version: '6.0', isLatest: false, releaseDate: new Date('2021-11-08'), isLTS: true }
    ],
    currentStableVersion: '8.0',
    latestVersion: '8.0'
  }
  // Add more technologies as needed
];

module.exports = technologies;
