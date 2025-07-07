# Effect + TanStack Start Demo

This project demonstrates how to integrate Effect-TS with TanStack Start for building robust, type-safe async applications with proper error handling.

## 🚀 Features Implemented

### 1. Effect Services (`src/services/`)
- **ApiService**: Effect service with typed async operations
- **RuntimeServer**: Server-side Effect runtime
- **RuntimeClient**: Client-side Effect runtime
- **Schema definitions**: Branded types and error classes

### 2. Server Functions (`src/server/api.ts`)
- **fetchApiData**: GET endpoint with Effect integration
- **processMessage**: POST endpoint with form validation
- **fetchUserData**: User lookup with error simulation
- **streamEvents**: Server-sent events with ReadableStream

### 3. Interactive Components

#### Async Demo (`/async-demo`)
- Click handlers with `useServerFn` hook
- Multiple async operations with different delays
- User data fetching with validation
- Comprehensive error handling and loading states

#### Form Demo (`/form-demo`)
- Server actions with `useActionState` (React 19)
- FormData validation with Zod schemas
- Real-time event streaming
- Progressive enhancement support

### 4. Error Handling
- Effect.match for declarative success/failure handling
- Typed error classes (ApiError, NetworkError)
- React Error Boundaries for UI errors
- Comprehensive client/server error boundaries

## 🛠️ Technology Stack

- **TanStack Start**: Full-stack React framework
- **Effect-TS**: Functional programming and error handling
- **TypeScript**: Type safety and developer experience
- **Zod**: Runtime validation
- **Tailwind CSS**: Styling and responsive design

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── ErrorBoundary.tsx
├── lib/
│   └── effect-utils.ts  # Effect utility functions
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

## 🔧 Key Patterns

### Effect Service Pattern
```typescript
export class ApiService extends Effect.Service<ApiService>()('ApiService', {
  effect: Effect.gen(function* () {
    const fetchData = (delay: number) => 
      Effect.gen(function* () {
        yield* Effect.sleep(`${delay} millis`)
        // ... async logic
      })
    
    return { fetchData } as const
  })
}) {}
```

### Server Function with Effect
```typescript
export const fetchApiData = createServerFn({ method: 'GET' })
  .validator(z.object({ delay: z.number().optional() }))
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const api = yield* ApiService
      const result = yield* api.fetchData(data?.delay || 1000)
      return result
    }).pipe(
      Effect.provide(ApiService.Default),
      Effect.match({
        onFailure: (error) => ({ success: false, error: error.message }),
        onSuccess: (data) => ({ success: true, data })
      })
    )

    return RuntimeServer.runPromise(program)
  })
```

### Component with Server Function
```typescript
function AsyncComponent() {
  const [result, setResult] = useState<ApiResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const serverFetch = useServerFn(fetchApiData)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await serverFetch({ data: { delay: 1500 } })
      setResult(response)
    } catch (err) {
      setResult({ success: false, error: err.message })
    } finally {
      setIsLoading(false)
    }
  }
  
  // ... render logic
}
```

## 🎯 Best Practices Demonstrated

1. **Service Layer Architecture**: Clean separation of concerns with Effect services
2. **Type Safety**: End-to-end type safety from server to client
3. **Error Handling**: Comprehensive error management with Effect.match
4. **Loading States**: Proper async state management
5. **Form Validation**: Runtime validation with Zod schemas
6. **Progressive Enhancement**: Forms work without JavaScript
7. **Server-Side Streaming**: Real-time data with Server-Sent Events

## 🚦 Getting Started

1. Navigate to the home page to see an overview
2. Try the **Async Demo** for click-based async operations
3. Test the **Form Demo** for server actions and streaming
4. Check the browser console for Effect logging output

## 💡 Error Testing

- Use "invalid" as user ID in Async Demo to trigger user not found errors
- Leave form fields empty to test validation errors
- Check browser network tab to see server function calls
- Random API failures (10% chance) demonstrate error handling

This implementation follows the Effect-React-19 standards defined in the cursor rules and demonstrates production-ready patterns for building robust full-stack applications.