import { test, expect } from '@playwright/test';

test.describe('All Demo Pages Integration', () => {
  const demoPages = [
    { path: '/', title: 'Home Page' },
    { path: '/async-demo', title: 'Async Demo' },
    { path: '/form-demo', title: 'Form Demo' },
    { path: '/auth-demo', title: 'Auth Demo' }
  ];

  test('should load all demo pages without errors', async ({ page }) => {
    for (const demo of demoPages) {
      await page.goto(demo.path);
      
      // Basic page load validation
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      await expect(page).toHaveTitle(/Vibe Lottery/);
      
      // Navigation should be present
      await expect(page.getByRole('link', { name: 'Vibe Lottery' })).toBeVisible();
      
      console.log(`✅ ${demo.title} (${demo.path}) loaded successfully`);
    }
  });

  test('should have consistent navigation across all pages', async ({ page }) => {
    for (const demo of demoPages) {
      await page.goto(demo.path);
      
      // All navigation links should be present - use first() to handle multiple matches
      await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Async Demo' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Form Demo' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Auth Demo' }).first()).toBeVisible();
      
      // Navigation links should have correct hrefs - use first() for consistency
      await expect(page.getByRole('link', { name: 'Home' }).first()).toHaveAttribute('href', '/');
      await expect(page.getByRole('link', { name: 'Async Demo' }).first()).toHaveAttribute('href', '/async-demo');
      await expect(page.getByRole('link', { name: 'Form Demo' }).first()).toHaveAttribute('href', '/form-demo');
      await expect(page.getByRole('link', { name: 'Auth Demo' }).first()).toHaveAttribute('href', '/auth-demo');
    }
  });

  test('should have proper page structure and content', async ({ page }) => {
    // Home page - has different h1 content
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Effect + TanStack Start');
    
    // Async demo page
    await page.goto('/async-demo');
    await expect(page.locator('h1')).toContainText('Effect + TanStack Start Demo');
    await expect(page.getByRole('button', { name: 'Fetch Data (1.5s delay)' })).toBeVisible();
    
    // Form demo page
    await page.goto('/form-demo');
    await expect(page.locator('h1')).toContainText('Form Processing with Effect');
    await expect(page.getByRole('button', { name: 'Process Message' })).toBeVisible();
    
    // Auth demo page
    await page.goto('/auth-demo');
    await expect(page.locator('h1')).toContainText('Authentication Demo with Effect-TS');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should have Effect-TS information on all demo pages', async ({ page }) => {
    const effectPages = ['/async-demo', '/form-demo', '/auth-demo'];
    
    for (const pagePath of effectPages) {
      await page.goto(pagePath);
      
      // Should mention Effect patterns somewhere on the page
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/Effect|effect|Effect-TS/);
      
      console.log(`✅ Effect-TS content found on ${pagePath}`);
    }
  });

  test('should have interactive elements on all demo pages', async ({ page }) => {
    // Async demo - interactive buttons
    await page.goto('/async-demo');
    const asyncButtons = page.getByRole('button');
    await expect(asyncButtons.first()).toBeEnabled();
    
    // Form demo - interactive form
    await page.goto('/form-demo');
    const formButton = page.getByRole('button', { name: 'Process Message' });
    await expect(formButton).toBeEnabled();
    
    // Auth demo - interactive login
    await page.goto('/auth-demo');
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeEnabled();
  });

  test('should maintain responsive design across pages', async ({ page }) => {
    // Test common responsive breakpoint
    await page.setViewportSize({ width: 768, height: 1024 });
    
    for (const demo of demoPages) {
      await page.goto(demo.path);
      
      // Navigation should remain visible and functional
      await expect(page.getByRole('link', { name: 'Vibe Lottery' })).toBeVisible();
      
      // Main content should be visible
      await expect(page.locator('h1')).toBeVisible();
      
      // Page should not have horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow small tolerance
    }
  });

  test('should have proper accessibility landmarks', async ({ page }) => {
    for (const demo of demoPages) {
      await page.goto(demo.path);
      
      // Should have navigation landmark
      await expect(page.locator('nav')).toBeVisible();
      
      // Should have main content landmark
      await expect(page.locator('main')).toBeVisible();
      
      // Should have proper heading structure
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should not have console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    
    for (const demo of demoPages) {
      await page.goto(demo.path);
      await page.waitForLoadState('networkidle');
      
      // Allow some time for any async operations
      await page.waitForTimeout(1000);
    }
    
    // Filter out expected/harmless errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('404') && 
      !error.includes('favicon') &&
      !error.includes('manifest')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});