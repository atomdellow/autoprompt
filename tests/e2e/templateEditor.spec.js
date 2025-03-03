const { test, expect } = require('@playwright/test');

test.describe('Template Editor Form', () => {
  // Store console logs for later reporting
  const browserLogs = [];
  
  test.beforeEach(async ({ page }) => {
    // Listen to console messages
    page.on('console', message => {
      const text = `[${message.type()}] ${message.text()}`;
      browserLogs.push(text);
      console.log(text); // Also log to test output
    });
    
    // Navigate to the template editor page
    await page.goto('http://localhost:5173/templates/new');
  });
  
  test('should fill in form fields, submit, and verify submission', async ({ page }) => {
    // Test data
    const templateName = 'E2E Test Template';
    const templateDescription = 'This is an automated test template';
    const templateStructure = `Create a {languages} application that uses {frameworks} for the frontend
and {databases} for data storage. The application should implement {designPatterns} patterns
and follow {principles} principles. The frontend should utilize {frontend} technologies,
while the backend should be built with {backend}. Implement tests using {testing} and
deploy using {devops}.`;

    // Fill in the form fields
    await page.fill('#template-name', templateName);
    await page.fill('#template-description', templateDescription);
    await page.fill('#template-structure', templateStructure);
    
    // Add technologies - Languages
    await addTags(page, '.technologies-section .tech-group:nth-child(1) input', ['JavaScript', 'TypeScript']);
    
    // Add technologies - Frameworks
    await addTags(page, '.technologies-section .tech-group:nth-child(2) input', ['React', 'Express']);
    
    // Add technologies - Databases
    await addTags(page, '.technologies-section .tech-group:nth-child(3) input', ['MongoDB']);
    
    // Add design patterns
    await addTags(page, '.best-practices-section .tech-group:nth-child(1) input', ['Singleton', 'MVC']);
    
    // Add principles
    await addTags(page, '.best-practices-section .tech-group:nth-child(2) input', ['SOLID', 'DRY']);
    
    // Add frontend technologies
    await addTags(page, '.more-technologies-section .tech-group:nth-child(1) input', ['TailwindCSS']);
    
    // Add backend technologies
    await addTags(page, '.more-technologies-section .tech-group:nth-child(2) input', ['Node.js']);
    
    // Add testing technologies
    await addTags(page, '.more-technologies-section .tech-group:nth-child(3) input', ['Jest']);
    
    // Add DevOps technologies
    await addTags(page, '.more-technologies-section .tech-group:nth-child(4) input', ['Docker', 'GitHub Actions']);
    
    // Intercept API calls to verify submission
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/templates') && 
      response.status() === 201
    );
    
    // Submit the form
    await page.click('button.btn-primary');
    
    // Wait for successful submission response
    const response = await responsePromise;
    const responseData = await response.json();
    
    // Assertions
    expect(responseData).toBeTruthy();
    expect(responseData.name).toBe(templateName);
    expect(responseData.technologies.languages).toContain('JavaScript');
    expect(responseData.technologies.languages).toContain('TypeScript');
    expect(responseData.technologies.frameworks).toContain('React');
    expect(responseData.technologies.databases).toContain('MongoDB');
    expect(responseData.bestPractices.principles).toContain('SOLID');
    
    // Verify UI feedback
    await expect(page.locator('text=Template saved successfully')).toBeVisible();
    
    // Log all captured browser logs
    console.log('\n---- BROWSER CONSOLE LOGS ----');
    browserLogs.forEach(log => console.log(log));
    console.log('---- END OF BROWSER LOGS ----\n');
  });
});

/**
 * Helper function to add tags to a TagInput component
 */
async function addTags(page, selector, tags) {
  for (const tag of tags) {
    await page.fill(selector, tag);
    await page.press(selector, 'Enter');
    // Verify tag was added
    await expect(page.locator('.tag', { hasText: tag })).toBeVisible();
  }
}
