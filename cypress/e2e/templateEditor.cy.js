describe('Template Editor Form', () => {
  // Store console logs for reporting
  let consoleLogs = [];

  beforeEach(() => {
    // Reset logs before each test
    consoleLogs = [];

    // Listen to console logs
    cy.on('window:console', (msg) => {
      consoleLogs.push({
        type: msg.type,
        message: msg.message
      });
      cy.task('log', `[${msg.type}] ${msg.message}`);
    });

    // Visit the template editor page
    cy.visit('/templates/new');
  });

  it('should fill in form fields, submit, and verify submission', () => {
    // Test data
    const templateName = 'E2E Test Template';
    const templateDescription = 'This is an automated test template';
    const templateStructure = `Create a {languages} application that uses {frameworks} for the frontend
and {databases} for data storage. The application should implement {designPatterns} patterns
and follow {principles} principles. The frontend should utilize {frontend} technologies,
while the backend should be built with {backend}. Implement tests using {testing} and
deploy using {devops}.`;

    // Fill in form fields
    cy.get('#template-name').type(templateName);
    cy.get('#template-description').type(templateDescription);
    cy.get('#template-structure').type(templateStructure);
    
    // Add languages
    cy.addTags('.technologies-section .tech-group:nth-child(1) input', ['JavaScript', 'TypeScript']);
    
    // Add frameworks
    cy.addTags('.technologies-section .tech-group:nth-child(2) input', ['React', 'Express']);
    
    // Add databases
    cy.addTags('.technologies-section .tech-group:nth-child(3) input', ['MongoDB']);
    
    // Add design patterns
    cy.addTags('.best-practices-section .tech-group:nth-child(1) input', ['Singleton', 'MVC']);
    
    // Add principles
    cy.addTags('.best-practices-section .tech-group:nth-child(2) input', ['SOLID', 'DRY']);
    
    // Add frontend technologies
    cy.addTags('.more-technologies-section .tech-group:nth-child(1) input', ['TailwindCSS']);
    
    // Add backend technologies
    cy.addTags('.more-technologies-section .tech-group:nth-child(2) input', ['Node.js']);
    
    // Add testing technologies
    cy.addTags('.more-technologies-section .tech-group:nth-child(3) input', ['Jest']);
    
    // Add DevOps technologies
    cy.addTags('.more-technologies-section .tech-group:nth-child(4) input', ['Docker', 'GitHub Actions']);
    
    // Intercept API request
    cy.intercept('POST', '/api/templates').as('saveTemplate');
    
    // Submit form
    cy.get('button.btn-primary').click();
    
    // Wait for API request and validate response
    cy.wait('@saveTemplate').then((interception) => {
      // Verify request body
      expect(interception.request.body).to.have.property('name', templateName);
      expect(interception.request.body).to.have.property('description', templateDescription);
      expect(interception.request.body).to.have.property('structure', templateStructure);
      
      // Verify technologies
      expect(interception.request.body.technologies.languages).to.include('JavaScript');
      expect(interception.request.body.technologies.languages).to.include('TypeScript');
      expect(interception.request.body.technologies.frameworks).to.include('React');
      expect(interception.request.body.technologies.databases).to.include('MongoDB');
      
      // Verify best practices
      expect(interception.request.body.bestPractices.designPatterns).to.include('Singleton');
      expect(interception.request.body.bestPractices.principles).to.include('SOLID');
      
      // Verify frontend and backend technologies
      expect(interception.request.body.technologies.frontend).to.include('TailwindCSS');
      expect(interception.request.body.technologies.backend).to.include('Node.js');
      expect(interception.request.body.technologies.testing).to.include('Jest');
      expect(interception.request.body.technologies.devops).to.include('Docker');
      
      // Log console messages in the test report
      cy.log('**Console logs during test:**');
      consoleLogs.forEach(log => {
        cy.log(`[${log.type}] ${log.message}`);
      });
    });
    
    // Verify success message is displayed
    cy.contains('Template saved successfully').should('be.visible');
  });

  it('should validate required fields', () => {
    // Submit an empty form
    cy.get('button.btn-primary').click();
    
    // Check that validation is working (HTML5 validation will trigger)
    cy.get('#template-name:invalid').should('exist');
  });
  
  after(() => {
    // Output all console logs at the end of all tests
    cy.log('**All console logs:**');
    consoleLogs.forEach(log => {
      cy.log(`[${log.type}] ${log.message}`);
    });
  });
});
