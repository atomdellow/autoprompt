// Simple form filler test
describe('Template Editor Form Filler', () => {
  it('fills in the form automatically', () => {
    cy.visit('/templates/new');

    // Fill basic info
    cy.get('#template-name').type('Automated Test Template');
    cy.get('#template-description').type('This template was created with automation');

    // Fill template structure
    const structure = `Create a {languages} application using {frameworks} that connects to {databases}.
    
The application should implement {designPatterns} patterns and follow {principles} principles.

It should use {frontend} for the UI, {backend} for the server, 
{testing} for automated tests, and {devops} for deployment.`;

    cy.get('#template-structure').type(structure);

    // Add languages
    cy.get('.technologies-section .tech-group:nth-child(1) input').type('JavaScript{enter}');
    cy.get('.technologies-section .tech-group:nth-child(1) input').type('TypeScript{enter}');

    // Add frameworks
    cy.get('.technologies-section .tech-group:nth-child(2) input').type('React{enter}');
    cy.get('.technologies-section .tech-group:nth-child(2) input').type('Express{enter}');

    // Add databases
    cy.get('.technologies-section .tech-group:nth-child(3) input').type('MongoDB{enter}');
    
    // Add design patterns
    cy.get('.best-practices-section .tech-group:nth-child(1) input').type('MVC{enter}');
    cy.get('.best-practices-section .tech-group:nth-child(1) input').type('Repository{enter}');
    
    // Add principles
    cy.get('.best-practices-section .tech-group:nth-child(2) input').type('SOLID{enter}');
    cy.get('.best-practices-section .tech-group:nth-child(2) input').type('DRY{enter}');
    
    // Add frontend technologies
    cy.get('.more-technologies-section .tech-group:nth-child(1) input').type('TailwindCSS{enter}');
    
    // Add backend technologies
    cy.get('.more-technologies-section .tech-group:nth-child(2) input').type('Node.js{enter}');
    
    // Add testing technologies
    cy.get('.more-technologies-section .tech-group:nth-child(3) input').type('Jest{enter}');
    
    // Add DevOps technologies
    cy.get('.more-technologies-section .tech-group:nth-child(4) input').type('Docker{enter}');
    
    // Submit form (uncomment when ready to actually submit)
    // cy.get('button.btn-primary').click();
  });
});
