# AGENTS.md

## Environment Notes

**IMPORTANT**: The code runs on a remote server. Do NOT run Docker commands (docker-compose, docker, etc.) to troubleshoot errors. The user will run these commands themselves. Focus on code changes, configurations, and providing instructions for commands the user should run.

## Build/Lint/Test Commands

### Frontend (cd frontend/)
- Build: `npm run build` - Builds production bundle.
- Lint: `npx biome check .` - Lints and formats JS/CSS (uses Biome).
- Test: `npm test` - Runs Jest tests.
- Single test: `npm test -- src/path/to/MyComponent.test.js` - Runs specific test file.

### Backend (cd backend/)
- Dev: `npm run dev` - Starts with nodemon.
- Test: `npm test` - Runs all Jest tests.
- Single test: `npm test -- path/to/test.js` - Runs specific test.

### Overall
- Full build/deploy: `docker-compose up --build` - Builds and starts all services.

## Code Style Guidelines

- **Formatting**: Use Biome (tab indent width 2, single quotes, trailing commas in ES5, semi-colons). Run `npx biome format .` before commits.
- **Linting**: Biome recommended rules enabled. No ESLint; avoid unused vars, prefer const/let.
- **Imports**: Auto-organized by Biome. Use relative paths (e.g., `import { useState } from 'react';`). Group by type: React, third-party, local.
- **Naming**: camelCase for vars/functions, PascalCase for React components/classes. Descriptive names (e.g., `fetchUserData` not `getData`).
- **Types**: Plain JS, but use JSDoc for props/functions. TS dev deps available for gradual typing.
- **Error Handling**: Try-catch for async ops. In Express, use `next(err)` or res.status(500). Validate inputs with express-validator.
- **React**: Functional components with hooks. No class components. Use React Query for data fetching.
- **General**: No inline styles; use Tailwind classes. Keep functions <50 lines. No console.logs in prod code.

No Cursor/Copilot rules found.