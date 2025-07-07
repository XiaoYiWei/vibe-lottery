# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2022
- **Strict Mode**: Enabled with `exactOptionalPropertyTypes` and `strictNullChecks`
- **Module System**: ESNext with bundler resolution
- **Path Aliases**: `~/*` maps to `./src/*`

## React Conventions
- **JSX**: Uses `react-jsx` transform
- **Components**: Functional components with TypeScript interfaces
- **Forwarding Refs**: Using `forwardRef` for UI components
- **Component Naming**: PascalCase with descriptive names
- **Export Pattern**: Named exports preferred (e.g., `export { Button }`)

## Styling Conventions
- **CSS Framework**: Tailwind CSS with custom CSS variables
- **Theme System**: HSL color values via CSS custom properties
- **Dark Mode**: Supported through CSS variables
- **Class Merging**: Uses `cn()` utility (clsx + tailwind-merge)
- **Component Variants**: Implemented via props with conditional classes

## Import Conventions
- **Path Aliases**: Uses `~/` for src imports
- **Import Order**: External libraries first, then internal modules
- **Relative Imports**: Used for nearby files (e.g., `../components/ui/Card`)

## Effect.js Patterns
- **Error Handling**: Uses `Effect.tryPromise` for async operations
- **Logging**: Uses `Effect.gen` with `Console.log`
- **Validation**: Custom validation functions with `Effect.fail`
- **Retry Logic**: Uses `Effect.retry` with configurable attempts

## File Naming
- **Components**: PascalCase (e.g., `Button.tsx`, `Card.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `effect-utils.ts`)
- **Routes**: kebab-case for special routes (e.g., `__root.tsx`)
- **Styles**: kebab-case (e.g., `globals.css`)