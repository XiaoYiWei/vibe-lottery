# Effect-TS Component Refactoring Standards

## **Component Refactoring Checklist**

### **Required Transformations**
- [ ] Replace `useState/useEffect` with `Effect.gen` workflows
- [ ] Replace `try-catch` blocks with `Effect.match` error handling  
- [ ] Replace plain interfaces with `Schema.Class` for type safety
- [ ] Implement `Effect.Service` for business logic
- [ ] Use `RuntimeClient` for Effect program execution
- [ ] Add `Effect.retry` with timeout for resilience
- [ ] Create comprehensive edge case tests (70+ tests minimum)

### **Effect-TS Patterns to Implement**

#### **1. Replace React State Management**
```typescript
// OLD: Traditional React pattern
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

// NEW: Effect-TS pattern
const [result, setResult] = useState<MyResult | null>(null)
const handleAction = () => {
  const program = Effect.gen(function* () {
    const service = yield* MyService
    const data = yield* service.fetchData()
    setResult(new MyResult({ success: true, data }))
  })
  
  const handleResult = Effect.match(program, {
    onFailure: (error) => setResult(new MyResult({ success: false, error: error.message })),
    onSuccess: () => {} // Success handled in program
  })
  
  RuntimeClient.runPromise(handleResult)
}
```

#### **2. Schema-First Data Models**
```typescript
// Replace plain interfaces with Schema.Class
export class AuthResult extends Schema.Class<AuthResult>('AuthResult')({
  success: Schema.Boolean,
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  error: Schema.optional(Schema.String),
  code: Schema.optional(Schema.String)
}) {}
```

#### **3. Effect.retry for Resilience**
```typescript
const resilientOperation = operation.pipe(
  Effect.retry({ times: 3 }),
  Effect.timeout('5 seconds')
)
```

#### **4. localStorage Error Handling**
```typescript
// Protect localStorage access
useEffect(() => {
  try {
    const savedToken = localStorage.getItem('auth-token')
    if (savedToken) {
      validateStoredToken(savedToken)
    }
  } catch (error) {
    console.error('Failed to access localStorage:', error)
  }
}, [])
```

### **Testing Requirements**
- Every Effect-TS pattern must be tested with multiple input parameters
- All error scenarios must have corresponding tests
- Schema validation must be tested with various data types
- RuntimeClient execution must be mocked for predictable testing
- Edge cases must include null/undefined, empty values, and boundary conditions

### **Code Quality Standards**
- **100% Effect-TS compliance** - no traditional React error patterns
- **Type safety** - end-to-end Schema validation
- **Error resilience** - graceful handling of all failure scenarios
- **Composable effects** - predictable async operations
- **Declarative error handling** - no hidden exceptions