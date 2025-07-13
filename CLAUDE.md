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

[... rest of the existing content remains unchanged ...]