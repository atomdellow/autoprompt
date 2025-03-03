describe('Prompt Generator', () => {
  before(() => {
    // Load test templates
    cy.fixture('templates').then((templates) => {
      cy.intercept('GET', '/api/templates', { body: templates }).as('getTemplates');
    });
  });
  
  beforeEach(() => {
    cy.visit('/prompt-generator');
    cy.wait('@getTemplates');
  });

  it('selects a template and generates a prompt', () => {
    // Select a template
    cy.get('select').select(1);

    // Check if template details are displayed
    cy.get('.template-details').should('be.visible');

    // Select technologies
    cy.get('.checkbox-item:contains("JavaScript") input').check();
    cy.get('.checkbox-item:contains("React") input').check();
    cy.get('.checkbox-item:contains("MongoDB") input').check();
    
    // Add custom requirements
    cy.get('.user-prompt').type('The app should include user authentication and a dashboard for analytics.');
    
    // Check if the prompt is generated
    cy.get('.generated-prompt').should('contain', 'JavaScript');
    cy.get('.generated-prompt').should('contain', 'React');
    cy.get('.generated-prompt').should('contain', 'MongoDB');
    cy.get('.generated-prompt').should('contain', 'user authentication');
    cy.get('.generated-prompt').should('contain', 'dashboard for analytics');
    
    // Test the copy to clipboard functionality
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
      cy.get('button:contains("Copy")').click();
      cy.window().its('navigator.clipboard.writeText').should('be.calledOnce');
    });
  });
});
