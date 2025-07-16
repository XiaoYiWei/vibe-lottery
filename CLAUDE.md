# Vibe Lottery - Development Guide

## **Project Overview**

A full-stack React application showcasing modern development practices with Effect-TS, TanStack Start, and comprehensive testing. Built following TDD and Tidy First principles.

---

## **Tech Stack**

### **Core Technologies**
- **React 19** - Server components and server actions
- **TanStack Start** - Full-stack React framework with SSR/SSG
- **TanStack Router** - Type-safe file-based routing
- **Effect-TS** - Functional programming with composable effects
- **TypeScript** - End-to-end type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server

### **Testing Framework**
- **Vitest** - Unit and integration testing
- **@testing-library/react** - Component testing utilities
- **Playwright** - End-to-end testing

---

## **Development Methodology**

### **TDD Principles (Kent Beck)**
1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code structure while keeping tests passing

### **Tidy First Approach**
- **Structural Changes**: Code organization without behavior changes (rename, extract, move)
- **Behavioral Changes**: Adding or modifying functionality
- **Rule**: Never mix structural and behavioral changes in same commit

### **Development Workflow**
1. Write smallest failing test for new functionality
2. Implement minimum code to pass test
3. Run all tests to confirm green state
4. Make structural improvements (if needed)
5. Commit structural changes separately
6. Repeat cycle for next increment

---

## **Architecture Patterns**

### **1. Effect Service Pattern**
```typescript
export const Api = Effect.Service<Api>()('Api', {
  effect: Effect.succeed({
    fetchData: (delay) => Effect.gen(/* implementation */),
    processMessage: (message) => Effect.gen(/* implementation */)
  })
})
```

### **2. Schema-First Validation**
```typescript
export class ApiData extends Schema.Class<ApiData>('ApiData')({
  message: Schema.String,
  timestamp: Schema.Number,
  id: Schema.Number
}) {}
```

### **3. Tagged Error Handling**
```typescript
export class ApiError extends Schema.TaggedError<ApiError>()('ApiError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}
```

### **4. Runtime Separation**
```typescript
export const RuntimeServer = ManagedRuntime.make(MainLayer)
export const RuntimeClient = ManagedRuntime.make(MainLayer)
```

### **5. Effect-TS Component Pattern**
```typescript
// Replace traditional React patterns with Effect-TS
const handleAction = () => {
  const program = Effect.gen(function* () {
    const service = yield* MyService
    const result = yield* service.performAction()
    // Handle success in program
  })

  const handleResult = Effect.match(program, {
    onFailure: (error) => {
      // Handle errors with tagged error types
    },
    onSuccess: () => {
      // Success handling
    }
  })

  RuntimeClient.runPromise(handleResult)
}
```

---

## **Project Structure**

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   └── __tests__/          # Component tests
├── services/
│   ├── ApiService.ts       # API service with Effect patterns
│   ├── AuthService.ts      # Authentication service
│   ├── RuntimeClient.ts    # Client runtime configuration
│   ├── RuntimeServer.ts    # Server runtime configuration
│   └── __tests__/          # Service tests
├── routes/
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Home page
│   ├── async-demo.tsx      # Async operations demo
│   ├── form-demo.tsx       # Form processing demo
│   └── auth-demo.tsx       # Authentication demo
├── server/
│   ├── api.ts              # Server functions
│   └── auth.ts             # Auth server functions
└── test/
    └── setup.ts            # Test configuration
```

---

## **Testing Strategy**

### **Test Types**
- **Unit Tests**: Individual components and services (Vitest)
- **Integration Tests**: Service interactions with Effect runtime
- **E2E Tests**: Complete user workflows (Playwright)
- **Edge Case Tests**: Comprehensive testing of Effect-TS patterns with multiple input parameters

### **Test Commands**
```bash
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:ui           # Web UI
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright tests
```

### **Testing Principles**
- Write tests first (TDD)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- **Test all Effect-TS patterns with multiple input parameters for edge cases**

### **Effect-TS Testing Requirements**
- **Schema Validation**: Test with complex nested structures, null/undefined values, empty objects
- **Effect.gen Workflows**: Test sequential operations, concurrent execution, parameter combinations
- **Effect.match Patterns**: Test all error scenarios and success paths
- **Effect.retry Operations**: Test various failure patterns, timeout handling, recovery logic
- **RuntimeClient**: Test memory pressure, error types, timeout scenarios
- **localStorage Integration**: Test corrupted data, quota exceeded, access denied situations

---

## **Development Standards**

### **Code Quality Rules**
- Use Effect-TS for all error handling (no try/catch)
- All async operations use Effect.gen patterns
- Schema validation for all data boundaries
- Tagged errors for typed error handling
- Functional composition over imperative code
- **Replace React patterns with Effect-TS equivalents**:
  - `useState/useEffect` → `Effect.gen` workflows
  - `try-catch` blocks → `Effect.match` error handling
  - Plain interfaces → `Schema.Class` for type safety
- **Implement Effect patterns**:
  - `Effect.Service` for business logic
  - `Effect.gen` for async operations
  - `Effect.match` for success/failure handling
  - `Effect.retry` with timeout for resilience
  - `RuntimeClient` for Effect program execution

### **Commit Guidelines**
- All tests must pass before committing
- No compiler/linter warnings
- Separate structural from behavioral changes
- Small, focused commits with clear messages

### **File Organization**
- Co-locate tests with source files
- Group related functionality in services
- Separate client/server runtime configurations
- Keep components pure and testable

---

## **Demo Pages**

1. **Home (`/`)** - Project overview and navigation
2. **Async Demo (`/async-demo`)** - Effect-TS async operations
3. **Form Demo (`/form-demo`)** - Server actions and form processing
4. **Auth Demo (`/auth-demo`)** - Complete authentication flow

---

## **Key Achievements**

✅ **Effect-TS Integration** - Complete service architecture with dependency injection
✅ **Type Safety** - End-to-end TypeScript with runtime validation
✅ **Error Handling** - Tagged errors and Effect.match patterns
✅ **Testing Setup** - Vitest + Playwright with comprehensive coverage
✅ **Authentication** - JWT-based auth with Effect patterns
✅ **Server Functions** - TanStack Start integration with Effect workflows
✅ **Comprehensive Edge Case Testing** - 71 tests covering all Effect-TS patterns
✅ **Schema-First Architecture** - Runtime validation with Schema.Class
✅ **Effect Pattern Compliance** - No traditional React error patterns

---

## **Development Reminders**

- Always use Serena MCP tools for code exploration
- Follow TDD cycle religiously: Red → Green → Refactor
- Separate structural changes from behavioral changes
- Use Vitest for unit/integration tests
- Use Playwright MCP for E2E testing validation
- Maintain high code quality through continuous refactoring
- Write meaningful test names that describe behavior
- Keep methods small and focused on single responsibility
- **Never use traditional React error patterns** - always use Effect-TS
- **Test all Effect-TS patterns with comprehensive edge cases**
- **Ensure 100% Effect-TS compliance** in all components
- **Mock RuntimeClient for predictable testing**
- **Test Schema validation with various data types**
- **Verify error resilience with intentional failures**

## **Effect-TS Implementation Standards**

### **Component Refactoring Checklist**
- [ ] Replace `useState/useEffect` with `Effect.gen` workflows
- [ ] Replace `try-catch` blocks with `Effect.match` error handling
- [ ] Replace plain interfaces with `Schema.Class` for type safety
- [ ] Implement `Effect.Service` for business logic
- [ ] Use `RuntimeClient` for Effect program execution
- [ ] Add `Effect.retry` with timeout for resilience
- [ ] Create comprehensive edge case tests

### **Testing Requirements**
- **Minimum 70+ tests** for complex Effect-TS components
- **Schema validation tests** with multiple data structures
- **Effect.gen workflow tests** with parameter combinations
- **Effect.match error scenario tests** for all failure paths
- **Effect.retry resilience tests** with various failure patterns
- **RuntimeClient edge case tests** including timeouts and memory pressure
- **localStorage integration tests** with corrupted data scenarios

### **Error Resilience Standards**
- All Effect-TS operations must handle edge cases gracefully
- localStorage access must be protected with try-catch
- Network and timeout errors must have recovery logic
- All error scenarios must be tested with intentional failures
- Components must remain functional after error conditions

## **Project Principles**
- **Effect-TS First**: All async operations and error handling use Effect patterns
- **Schema-First Architecture**: Runtime validation matches compile-time types
- **Comprehensive Testing**: Every Effect-TS pattern tested with multiple input parameters
- **Edge Case Coverage**: Test all failure scenarios and recovery mechanisms
- **Type Safety**: End-to-end type safety with runtime validation
