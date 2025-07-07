import { test, expect } from '@playwright/test';

test.describe('Async Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/async-demo');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Effect + TanStack Start Demo');
    await expect(page.locator('p')).toContainText('Demonstrating async operations with Effect-TS and server functions');
  });

  test('should have API Data Fetching section', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('API Data Fetching');
    
    // Check for buttons
    await expect(page.getByRole('button', { name: 'Fetch Data (1.5s delay)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quick Fetch (0.1s delay)' })).toBeVisible();
  });

  test('should have User Data Fetching section', async ({ page }) => {
    await expect(page.locator('h2').nth(1)).toContainText('User Data Fetching');
    
    // Check for user input and button
    await expect(page.locator('#userId')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fetch User' })).toBeVisible();
  });

  test('should fetch data successfully with quick fetch', async ({ page }) => {
    // Click quick fetch button
    await page.getByRole('button', { name: 'Quick Fetch (0.1s delay)' }).click();
    
    // Wait for loading state
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible();
    
    // Wait for result to appear
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h3')).toContainText('✅ Success!');
    
    // Check that JSON data is displayed
    await expect(page.locator('pre')).toBeVisible();
  });

  test('should fetch data successfully with slow fetch', async ({ page }) => {
    // Click slow fetch button
    await page.getByRole('button', { name: 'Fetch Data (1.5s delay)' }).click();
    
    // Wait for loading state
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible();
    
    // Wait for result to appear (longer timeout for slow fetch)
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3')).toContainText('✅ Success!');
    
    // Check that JSON data is displayed
    await expect(page.locator('pre')).toBeVisible();
  });

  test('should fetch valid user data successfully', async ({ page }) => {
    // Fill in user ID
    await page.locator('#userId').fill('123');
    
    // Click fetch user button
    await page.getByRole('button', { name: 'Fetch User' }).click();
    
    // Wait for loading state
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible();
    
    // Wait for result to appear
    await expect(page.locator('.bg-green-50').nth(1)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h3').nth(1)).toContainText('✅ User Found!');
    
    // Check that user data is displayed
    await expect(page.locator('pre').nth(1)).toBeVisible();
  });

  test('should handle invalid user ID error', async ({ page }) => {
    // Fill in invalid user ID
    await page.locator('#userId').fill('invalid');
    
    // Click fetch user button
    await page.getByRole('button', { name: 'Fetch User' }).click();
    
    // Wait for loading state
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible();
    
    // Wait for error result to appear
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h3')).toContainText('❌ Error');
    
    // Check that error message is displayed
    await expect(page.locator('p')).toContainText('Message:');
  });

  test('should disable fetch user button when user ID is empty', async ({ page }) => {
    // Clear user ID field
    await page.locator('#userId').clear();
    
    // Check that fetch user button is disabled
    await expect(page.getByRole('button', { name: 'Fetch User' })).toBeDisabled();
  });

  test('should disable buttons during loading', async ({ page }) => {
    // Start slow fetch
    await page.getByRole('button', { name: 'Fetch Data (1.5s delay)' }).click();
    
    // Check that both API fetch buttons are disabled during loading
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Quick Fetch (0.1s delay)' })).toBeDisabled();
  });

  test('should show information section', async ({ page }) => {
    await expect(page.locator('h2').nth(2)).toContainText('How It Works');
    
    // Check for information bullets
    await expect(page.locator('p')).toContainText('createServerFn');
    await expect(page.locator('p')).toContainText('useServerFn');
    await expect(page.locator('p')).toContainText('Effect.match');
  });

  test('should handle concurrent requests properly', async ({ page }) => {
    // Start both API requests simultaneously
    await Promise.all([
      page.getByRole('button', { name: 'Quick Fetch (0.1s delay)' }).click(),
      page.locator('#userId').fill('456'),
      page.getByRole('button', { name: 'Fetch User' }).click()
    ]);
    
    // Wait for both results to appear
    await expect(page.locator('.bg-green-50')).toHaveCount(2, { timeout: 10000 });
    
    // Check that both success messages are displayed
    await expect(page.locator('h3')).toContainText('✅ Success!');
    await expect(page.locator('h3')).toContainText('✅ User Found!');
  });

  test('should preserve user input after failed request', async ({ page }) => {
    // Fill in invalid user ID
    await page.locator('#userId').fill('invalid');
    
    // Click fetch user button
    await page.getByRole('button', { name: 'Fetch User' }).click();
    
    // Wait for error result
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
    
    // Check that user input is preserved
    await expect(page.locator('#userId')).toHaveValue('invalid');
  });
});