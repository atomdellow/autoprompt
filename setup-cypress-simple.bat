@echo off
echo Setting up a minimal Cypress installation...

cd /d "C:\Users\adamd\OneDrive\Documents\Programming\autoprompt"

REM Clean install of minimal Cypress
npm install cypress@12.17.4 --save-dev

REM Create simplified folder structure
if not exist cypress mkdir cypress
if not exist cypress\e2e mkdir cypress\e2e

REM Create the basic config file
echo const { defineConfig } = require('cypress');> cypress.config.js
echo. >> cypress.config.js
echo module.exports = defineConfig({>> cypress.config.js
echo   e2e: {>> cypress.config.js
echo     baseUrl: 'http://localhost:5173',>> cypress.config.js
echo     specPattern: 'cypress/e2e/**/*.cy.js',>> cypress.config.js
echo     supportFile: false,>> cypress.config.js
echo     fixturesFolder: false>> cypress.config.js
echo   },>> cypress.config.js
echo });>> cypress.config.js

REM Create a simple test file for filling the form
echo // Simple form filler test> cypress\e2e\form-filler.cy.js
echo describe('Template Editor Form Filler', () => {>> cypress\e2e\form-filler.cy.js
echo   it('fills in the form automatically', () => {>> cypress\e2e\form-filler.cy.js
echo     cy.visit('/templates/new');>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Fill basic info>> cypress\e2e\form-filler.cy.js
echo     cy.get('#template-name').type('Automated Test Template');>> cypress\e2e\form-filler.cy.js
echo     cy.get('#template-description').type('This template was created with automation');>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Fill template structure>> cypress\e2e\form-filler.cy.js
echo     const structure = `Create a {languages} application using {frameworks} that connects to {databases}.`;>> cypress\e2e\form-filler.cy.js
echo     cy.get('#template-structure').type(structure);>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Add languages>> cypress\e2e\form-filler.cy.js
echo     cy.get('.technologies-section .tech-group:nth-child(1) input').type('JavaScript{enter}');>> cypress\e2e\form-filler.cy.js
echo     cy.get('.technologies-section .tech-group:nth-child(1) input').type('TypeScript{enter}');>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Add frameworks>> cypress\e2e\form-filler.cy.js
echo     cy.get('.technologies-section .tech-group:nth-child(2) input').type('React{enter}');>> cypress\e2e\form-filler.cy.js
echo     cy.get('.technologies-section .tech-group:nth-child(2) input').type('Express{enter}');>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Add databases>> cypress\e2e\form-filler.cy.js
echo     cy.get('.technologies-section .tech-group:nth-child(3) input').type('MongoDB{enter}');>> cypress\e2e\form-filler.cy.js
echo. >> cypress\e2e\form-filler.cy.js
echo     // Submit form (uncomment when ready to actually submit)>> cypress\e2e\form-filler.cy.js
echo     // cy.get('button.btn-primary').click();>> cypress\e2e\form-filler.cy.js
echo   });>> cypress\e2e\form-filler.cy.js
echo });>> cypress\e2e\form-filler.cy.js

REM Add script to package.json
npm pkg set scripts.cypress="cypress open"

echo.
echo Setup complete! Run the form filler with:
echo npm run cypress
echo.
echo Then select "E2E Testing" and choose form-filler.cy.js
pause
