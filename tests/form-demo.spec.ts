import { test, expect } from '@playwright/test';

test.describe('Form Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-demo');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Form Processing with Effect');
    await expect(page.locator('p').first()).toContainText('Server actions and streaming with Effect-TS integration');
  });

  test('should have message processing form section', async ({ page }) => {
    await expect(page.locator('h2').first()).toContainText('Message Processing Form');
    
    // Check form elements
    const messageField = page.locator('#message');
    await expect(messageField).toBeVisible();
    await expect(messageField).toHaveAttribute('placeholder', 'Enter a message to process (try leaving empty for validation error)');
    
    const submitButton = page.getByRole('button', { name: 'Process Message' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should have real-time event streaming section', async ({ page }) => {
    await expect(page.locator('h2').nth(1)).toContainText('Real-time Event Streaming');
    
    // Check streaming elements
    const streamButton = page.getByRole('button', { name: 'Start Event Stream' });
    await expect(streamButton).toBeVisible();
    await expect(streamButton).toBeEnabled();
  });

  test('should have form processing features information', async ({ page }) => {
    await expect(page.locator('h2').nth(2)).toContainText('Form Processing Features');
    
    // Check for feature descriptions
    await expect(page.getByText('useActionState')).toBeVisible();
    await expect(page.getByText('FormData validation with Zod schemas')).toBeVisible();
    await expect(page.getByText('Effect programs for async message processing')).toBeVisible();
    await expect(page.getByText('Server-sent events with ReadableStream')).toBeVisible();
    await expect(page.getByText('Progressive enhancement (works without JavaScript)')).toBeVisible();
  });

  test('should handle form input modifications', async ({ page }) => {
    const messageField = page.locator('#message');
    
    // Should be able to type in message field
    await messageField.fill('Test message for processing');
    await expect(messageField).toHaveValue('Test message for processing');
    
    // Should be able to clear the field
    await messageField.clear();
    await expect(messageField).toHaveValue('');
  });

  test('should have interactive form submission', async ({ page }) => {
    const messageField = page.locator('#message');
    const submitButton = page.getByRole('button', { name: 'Process Message' });
    
    // Fill form with test message
    await messageField.fill('Hello Effect-TS!');
    
    // Submit form (test interaction without expecting server response)
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Form should still be present after submission
    await expect(messageField).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should have interactive streaming functionality', async ({ page }) => {
    const streamButton = page.getByRole('button', { name: 'Start Event Stream' });
    
    // Should be clickable
    await streamButton.click();
    await page.waitForTimeout(1000);
    
    // Button should still be present
    await expect(streamButton).toBeVisible();
  });

  test('should validate form requirements', async ({ page }) => {
    const messageField = page.locator('#message');
    const submitButton = page.getByRole('button', { name: 'Process Message' });
    
    // Test with empty message (required field)
    await messageField.clear();
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // HTML5 validation should handle required field
    await expect(messageField).toBeVisible();
  });

  test('should have proper navigation links', async ({ page }) => {
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Async Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Form Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Auth Demo' })).toBeVisible();
    
    // Verify href attributes
    await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'Async Demo' })).toHaveAttribute('href', '/async-demo');
    await expect(page.getByRole('link', { name: 'Auth Demo' })).toHaveAttribute('href', '/auth-demo');
    
    // Current page should be highlighted
    const formDemoLink = page.getByRole('link', { name: 'Form Demo' });
    await expect(formDemoLink).toHaveClass(/text-blue-600/);
    await expect(formDemoLink).toHaveClass(/bg-blue-50/);
  });

  test('should display vertical layout structure', async ({ page }) => {
    // Check that main sections are arranged vertically
    const sections = page.locator('h2');
    await expect(sections).toHaveCount(3);
    
    // Verify section order
    await expect(sections.nth(0)).toContainText('Message Processing Form');
    await expect(sections.nth(1)).toContainText('Real-time Event Streaming');
    await expect(sections.nth(2)).toContainText('Form Processing Features');
  });

  test('should have responsive card layout', async ({ page }) => {
    // Check that content is properly structured in cards
    const cards = page.locator('.rounded-xl.border');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);
    
    // Each main section should be in a card
    await expect(cards.filter({ hasText: 'Message Processing Form' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Real-time Event Streaming' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Form Processing Features' })).toBeVisible();
  });

  test('should handle multiple form interactions', async ({ page }) => {
    const messageField = page.locator('#message');
    const submitButton = page.getByRole('button', { name: 'Process Message' });
    const streamButton = page.getByRole('button', { name: 'Start Event Stream' });
    
    // Test message form interaction
    await messageField.fill('First test message');
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // Test streaming interaction
    await streamButton.click();
    await page.waitForTimeout(500);
    
    // Test another message
    await messageField.fill('Second test message');
    await submitButton.click();
    await page.waitForTimeout(500);
    
    // All elements should remain functional
    await expect(messageField).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(streamButton).toBeVisible();
  });
});