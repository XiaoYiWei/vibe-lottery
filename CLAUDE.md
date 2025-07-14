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

### **Development Principles**
- Always make good use of tools in serena mcp
- Always use Effect-TS for error management instead of try/catch statement
- Always use Playwright MCP for interactive testing and validation:

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

#### **6. Authentication Service Pattern**
```typescript
// Complete authentication service with Effect patterns
export const AuthService = Effect.Service<AuthService>()('AuthService', {
  effect: Effect.succeed({
    authenticate: (credentials: LoginCredentials) =>
      Effect.gen(function* () {
        // JWT token generation with Effect logging
        const token = yield* generateToken(credentials.username)
        yield* Effect.log(`Authentication successful for user: ${credentials.username}`)
        return new AuthToken({ token, expiresAt: Date.now() + 3600000, userId: credentials.username })
      }),
    
    performSecuredAction: (token: string, actionType: string) =>
      Effect.gen(function* () {
        // Token validation with tagged error handling
        const session = yield* Effect.mapError(
          decodeToken(token),
          (error) => new AuthorizationError({ message: error.message, code: error.code })
        )
        return new SecuredActionResult({ message: `Action "${actionType}" completed`, userId: session.userId })
      })
  })
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
│   ├── form-demo.tsx  # Form processing demo
│   └── auth-demo.tsx  # Authentication demo with Effect-TS
├── server/
│   ├── api.ts         # Server functions with Effect
│   └── auth.ts        # Authentication server functions
└── services/
    ├── ApiService.ts    # Effect service definitions
    ├── AuthService.ts   # Authentication service with Effect patterns
    ├── FormData.ts      # Form processing service
    ├── RuntimeServer.ts # Server runtime
    └── RuntimeClient.ts # Client runtime
```

## Development Standards
Follow the Effect-React-19 standards for consistent code patterns and architecture.

## Demo Pages & Testing

### **Available Demo Pages**
1. **Home (`/`)** - Project overview and navigation
2. **Async Demo (`/async-demo`)** - Effect-TS async operations with server functions
3. **Form Demo (`/form-demo`)** - Server actions, form processing, and streaming
4. **Auth Demo (`/auth-demo`)** - Complete authentication flow with Effect patterns

## **Effect-TS Integration Summary**

### **Key Achievements**
1. ✅ **Complete Authentication System** - JWT tokens, validation, state management
2. ✅ **Effect Service Architecture** - Dependency injection, layer composition
3. ✅ **Schema-First Development** - Runtime validation, type safety
4. ✅ **Error as Values** - TaggedError classes, Effect.match patterns
5. ✅ **Server Function Integration** - Effect.gen workflows, proper error handling
6. ✅ **Resilience Patterns** - Effect.retry, Effect.timeout, Effect.schedule
7. ✅ **Comprehensive Testing** - Playwright tests covering all functionality
