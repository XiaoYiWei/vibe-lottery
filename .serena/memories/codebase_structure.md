# Codebase Structure

## Directory Structure
```
/
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx  
│   │       └── Input.tsx
│   ├── lib/
│   │   ├── utils.ts     # Utility functions (cn for className merging)
│   │   └── effect-utils.ts  # Effect-related utilities
│   ├── routes/
│   │   ├── __root.tsx   # Root route component
│   │   └── index.tsx    # Home page
│   ├── styles/
│   │   └── globals.css  # Global styles with CSS variables
│   ├── providers.tsx    # React providers setup
│   ├── router.tsx       # Router configuration
│   └── routeTree.gen.ts # Generated route tree
├── app.config.ts        # TanStack Start configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Key Components
- **Root Component**: `src/routes/__root.tsx` - Main application wrapper
- **Home Page**: `src/routes/index.tsx` - Landing page showcasing the tech stack
- **UI Components**: Reusable components in `src/components/ui/`
- **Providers**: TanStack Query setup in `src/providers.tsx`