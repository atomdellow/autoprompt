// Import commands.js using ES2015 syntax:
import './commands';

// Prevent uncaught exception reporting to provide cleaner test reports
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  // This can be useful when testing a site that has JavaScript errors in production code
  // that don't actually impact the functionality you're testing
  console.log('Uncaught exception:', err.message);
  return false;
});

// Log all xhr requests to the console
if (Cypress.env('DEBUG')) {
  Cypress.on('log:added', (log) => {
    if (log.displayName === 'xhr' && log.state === 'failed') {
      console.log(`XHR failed: ${log.name} - ${log.message}`);
    }
  });
}
