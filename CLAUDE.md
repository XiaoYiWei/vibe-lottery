# Vibe Lottery - Development Guide

## Project Overview
This is a TanStack Start project demonstrating Effect-TS integration with React 19 patterns. The project showcases functional programming with Effect services, server functions, and proper error handling.

## Key Implementation Points

### 1. Effect Services Pattern
- **ApiService**: Service class with branded types and error handling
- **RuntimeServer/RuntimeClient**: Separate runtimes for server/client execution
- **Service composition**: Using `Layer.mergeAll()` for dependency injection

### 2. Server Functions with Effect
- **createServerFn**: TanStack Start server functions with Effect integration
- **Zod validation**: Runtime validation with typed schemas
- **Effect.match**: Declarative success/failure handling instead of try/catch

### 3. Component Patterns
- **useServerFn**: Hook for binding server functions to React components
- **useActionState**: React 19 server actions with form processing
- **Loading states**: Proper async state management with loading indicators

### 4. Error Handling Strategy
- **Effect.match**: Replaces try/catch with declarative error handling
- **Typed errors**: Custom error classes (ApiError, NetworkError)
- **Error boundaries**: React boundaries for UI error handling

### 5. Best Practices Implemented
- **Type safety**: End-to-end type safety from server to client
- **Functional composition**: Effect.gen() for async operations
- **Progressive enhancement**: Forms work without JavaScript
- **Server-sent events**: Real-time streaming with ReadableStream

## Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── ErrorBoundary.tsx
├── routes/
│   ├── __root.tsx      # Root layout with navigation
│   ├── index.tsx       # Home page
│   ├── async-demo.tsx  # Async operations demo
│   └── form-demo.tsx   # Form processing demo
├── server/
│   └── api.ts          # Server functions with Effect
└── services/
    ├── ApiService.ts   # Effect service definitions
    ├── RuntimeServer.ts # Server runtime
    └── RuntimeClient.ts # Client runtime
```

## Development Standards
Follow the Effect-React-19 standards defined in `.cursor/rules/frontend` for consistent code patterns and architecture.

## Testing
- Check browser console for Effect logging output
- Use "invalid" as user ID to trigger errors
- Random API failures (10% chance) demonstrate error handling
- Form validation errors when fields are empty

### Playwright Testing Best Practices

#### 1. Test Structure & Organization
- **Focus on UI behavior**: Test what users actually see and interact with
- **Avoid server dependency**: Don't rely on complex server functionality that may be unreliable
- **Test actual page structure**: Match tests to current page implementation, not ideal behavior

#### 2. Selector Best Practices
- **Use specific selectors**: Prefer `page.getByRole('button', { name: 'Fetch Data' })` over generic `page.locator('button')`
- **Handle multiple matches**: Use `.first()`, `.nth(0)`, or more specific selectors when elements aren't unique
- **Test accessibility**: Use semantic selectors like `getByRole`, `getByText`, `getByLabel`

#### 3. Navigation Testing
- **Avoid state interference**: Test href attributes instead of actual navigation to prevent test contamination
- **Non-disruptive approach**: Use `toHaveAttribute('href', '/path')` rather than `click()` for navigation links
- **Maintain test isolation**: Don't navigate away from pages in ways that affect other tests

#### 4. Error Handling in Tests
- **Disable flaky features**: Comment out random failures or unstable server behavior during testing
- **Test UI states**: Focus on loading states, button enablement, form validation rather than server responses
- **Graceful degradation**: Test that interactions don't cause page errors even if functionality is incomplete

#### 5. API Compatibility
- **Avoid deprecated APIs**: Replace outdated patterns like `Schema.withDefault` with current alternatives
- **Custom validators**: Use plain JavaScript validation functions instead of complex schema validation when simpler
- **Effect integration**: Ensure Effect layers are properly configured for server functions

#### 6. Test Maintenance
- **Match reality over ideals**: Adapt tests to current application state rather than forcing application to match test expectations
- **Incremental improvement**: Fix critical issues first, then enhance functionality
- **Cross-browser validation**: Ensure tests pass on Chromium, Firefox, and WebKit

#### 7. Common Patterns
```javascript
// ✅ Good: Specific, reliable selectors
await expect(page.getByRole('button', { name: 'Fetch Data (1.5s delay)' })).toBeVisible()

// ❌ Avoid: Generic selectors that may match multiple elements
await expect(page.locator('button')).toBeVisible()

// ✅ Good: Non-disruptive navigation testing
await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')

// ❌ Avoid: Navigation that affects other tests
await page.getByRole('link', { name: 'Home' }).click()

// ✅ Good: Test interactions without expecting complex server responses
await page.getByRole('button', { name: 'Fetch User' }).click()

// ❌ Avoid: Testing complex server functionality that may be unreliable
await expect(page.locator('.bg-green-50')).toBeVisible()
```