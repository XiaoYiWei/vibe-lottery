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