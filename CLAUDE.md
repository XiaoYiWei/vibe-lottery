# Vibe Lottery - Development Guide

## **Tech Stack & Architecture**

### **Core Tech Stack**
- **React 19** - Latest React with server components and server actions
- **TanStack Start** - Full-stack React framework with SSR/SSG
- **TanStack Router** - Type-safe file-based routing
- **Effect-TS** - Functional programming library for composable effects
- **TypeScript** - End-to-end type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Playwright** - End-to-end testing

### **Design Patterns**

#### **1. Effect Service Pattern**
```typescript
// Service-based architecture with dependency injection
export const Api = Effect.Service<Api>()('Api', {
  effect: Effect.succeed({
    fetchData: (delay) => Effect.gen(/* implementation */),
    processMessage: (message) => Effect.gen(/* implementation */)
  })
})
```

#### **2. Runtime Separation Pattern**
```typescript
// Separate runtimes for client/server execution
export const RuntimeServer = ManagedRuntime.make(MainLayer)
export const RuntimeClient = ManagedRuntime.make(MainLayer)
```

#### **3. Schema-First Validation**
```typescript
// Type-safe data models with runtime validation
export class ApiData extends Schema.Class<ApiData>('ApiData')({
  message: Schema.String,
  timestamp: Schema.Number,
  id: Schema.Number
}) {}
```

#### **4. Tagged Error Handling**
```typescript
// Declarative error handling with tagged errors
export class ApiError extends Schema.TaggedError<ApiError>()('ApiError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}
```

#### **5. Server Functions with Effect**
```typescript
// TanStack Start server functions with Effect integration
export const fetchApiData = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const api = yield* Api
      const result = yield* api.fetchData(data?.delay || 1000)
      return result
    })
    return RuntimeServer.runPromise(program)
  })
```

### **Core Principles**
1. **Functional Composition** - Effect.gen() for async operations, Layer composition, immutable transformations
2. **Type Safety** - End-to-end TypeScript, schema validation, branded types
3. **Error as Values** - No exceptions, tagged errors, declarative handling
4. **Separation of Concerns** - Modular architecture with clear boundaries
5. **Progressive Enhancement** - Server-first with client-side hydration
6. **Composable Architecture** - Service layers, Effect pipelines, runtime configuration

## Project Structure
```
src/
├── actions/            # Server actions for forms
├── components/
│   ├── ui/            # Reusable UI components
│   └── ErrorBoundary.tsx
├── routes/
│   ├── __root.tsx     # Root layout with navigation
│   ├── index.tsx      # Home page
│   ├── async-demo.tsx # Async operations demo
│   └── form-demo.tsx  # Form processing demo
├── server/
│   └── api.ts         # Server functions with Effect
└── services/
    ├── ApiService.ts  # Effect service definitions
    ├── FormData.ts    # Form processing service
    ├── RuntimeServer.ts # Server runtime
    └── RuntimeClient.ts # Client runtime
```

## Development Standards
Follow the Effect-React-19 standards for consistent code patterns and architecture.

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