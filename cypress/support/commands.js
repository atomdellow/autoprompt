// ***********************************************
// This file is processed and loaded automatically before your test files.
// This is a great place to put global configuration and behavior that modifies Cypress.
//
// Read more here: https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to add tags to a TagInput component
 * @param {string} selector - CSS selector for the input element
 * @param {string[]} tags - Array of tag texts to add
 */
Cypress.Commands.add('addTags', (selector, tags) => {
  tags.forEach((tag) => {
    cy.get(selector).type(tag);
    cy.get(selector).type('{enter}');
    cy.get('.tag').contains(tag).should('be.visible');
  });
});

/**
 * Custom command to login (example)
 */
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

/**
 * Custom command to drag and drop
 */
Cypress.Commands.add('dragAndDrop', (source, target) => {
  cy.get(source)
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', { clientX: 100, clientY: 100 })
    .get(target)
    .trigger('mousemove', { clientX: 100, clientY: 100 })
    .trigger('mouseup', { force: true });
});

/**
 * Custom command to check if an element is within viewport
 */
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});
