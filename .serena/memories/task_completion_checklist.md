# Task Completion Checklist

## When a Development Task is Completed

### 1. Code Quality Checks
- **Type Checking**: Run `pnpm typecheck` to ensure no TypeScript errors
- **Linting**: Run `pnpm lint` to check for type issues
- **Build Test**: Run `pnpm build` to ensure the application builds successfully

### 2. Testing (when applicable)
- No specific test framework is currently configured
- Manual testing through `pnpm dev` for UI changes
- Check that all new components render correctly

### 3. Code Review Checklist
- Follow TypeScript strict mode requirements
- Use proper React patterns (functional components, hooks)
- Apply consistent styling with Tailwind CSS
- Use the `cn()` utility for className merging
- Follow import conventions with path aliases
- Use Effect.js patterns for error handling when applicable

### 4. Documentation
- Update component interfaces if new props are added
- Ensure component variants are properly typed
- Add JSDoc comments for complex utility functions

### 5. Final Verification
- Start development server (`pnpm dev`) and test functionality
- Check that all imports resolve correctly
- Verify Tailwind styles are applied properly
- Ensure dark mode compatibility if applicable

## Notes
- The project currently has minimal testing setup
- Focus on TypeScript compilation and build success
- Manual testing is primary verification method