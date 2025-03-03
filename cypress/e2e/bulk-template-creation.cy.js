// Bulk template creation
describe('Bulk Template Creation', () => {
  const templates = [
    {
      name: "Basic Web App",
      description: "Template for a standard web application",
      structure: "Create a {languages} application using {frameworks} with {databases} for storage.",
      languages: ["JavaScript", "HTML", "CSS"],
      frameworks: ["React"],
      databases: ["MongoDB"],
      designPatterns: ["MVC"],
      principles: ["DRY", "SOLID"],
      frontend: ["TailwindCSS"],
      backend: ["Node.js"],
      testing: ["Jest"],
      devops: ["Docker"]
    },
    {
      name: "API Service",
      description: "RESTful API service template",
      structure: "Create a RESTful API using {languages} and {frameworks} with {databases} for data storage.",
      languages: ["TypeScript"],
      frameworks: ["Express", "NestJS"],
      databases: ["PostgreSQL"],
      designPatterns: ["Repository", "Dependency Injection"],
      principles: ["SOLID", "RESTful principles"],
      frontend: [],
      backend: ["Node.js", "TypeORM"],
      testing: ["Jest", "Supertest"],
      devops: ["Docker", "GitHub Actions"]
    },
    {
      name: "Mobile App",
      description: "Cross-platform mobile application template",
      structure: "Create a mobile app using {languages} and {frameworks} that works on both iOS and Android.",
      languages: ["JavaScript", "TypeScript"],
      frameworks: ["React Native"],
      databases: ["SQLite", "Firebase"],
      designPatterns: ["MVC", "Provider"],
      principles: ["DRY", "SOLID"],
      frontend: ["React Navigation", "Redux"],
      backend: ["Firebase"],
      testing: ["Jest", "React Native Testing Library"],
      devops: ["Fastlane", "CodePush"]
    }
  ];

  beforeEach(() => {
    cy.visit('/templates/new');
  });

  templates.forEach((template, index) => {
    it(`creates template ${index + 1}: ${template.name}`, () => {
      // Fill basic info
      cy.get('#template-name').clear().type(template.name);
      cy.get('#template-description').clear().type(template.description);
      cy.get('#template-structure').clear().type(template.structure);

      // Clear any existing tags first (assuming there's a clear/x button with class 'tag-remove')
      cy.get('.tag-remove').each(($el) => {
        cy.wrap($el).click();
      });

      // Add languages
      template.languages.forEach(lang => {
        cy.get('.technologies-section .tech-group:nth-child(1) input').type(`${lang}{enter}`);
      });

      // Add frameworks
      template.frameworks.forEach(framework => {
        cy.get('.technologies-section .tech-group:nth-child(2) input').type(`${framework}{enter}`);
      });

      // Add databases
      template.databases.forEach(db => {
        cy.get('.technologies-section .tech-group:nth-child(3) input').type(`${db}{enter}`);
      });

      // Add design patterns
      template.designPatterns.forEach(pattern => {
        cy.get('.best-practices-section .tech-group:nth-child(1) input').type(`${pattern}{enter}`);
      });

      // Add principles
      template.principles.forEach(principle => {
        cy.get('.best-practices-section .tech-group:nth-child(2) input').type(`${principle}{enter}`);
      });

      // Add frontend technologies
      template.frontend.forEach(tech => {
        cy.get('.more-technologies-section .tech-group:nth-child(1) input').type(`${tech}{enter}`);
      });

      // Add backend technologies
      template.backend.forEach(tech => {
        cy.get('.more-technologies-section .tech-group:nth-child(2) input').type(`${tech}{enter}`);
      });

      // Add testing technologies
      template.testing.forEach(tech => {
        cy.get('.more-technologies-section .tech-group:nth-child(3) input').type(`${tech}{enter}`);
      });

      // Add DevOps technologies
      template.devops.forEach(tech => {
        cy.get('.more-technologies-section .tech-group:nth-child(4) input').type(`${tech}{enter}`);
      });

      // Submit the form
      cy.get('button.btn-primary').click();
      
      // Wait for the success message
      cy.contains('Template saved successfully', { timeout: 10000 }).should('be.visible');
      
      // Go back to create a new template
      cy.visit('/templates/new');
    });
  });
});
