# KYC-Based ML Tool (Frontend)

This repo contains the frontend SPA for the KYC risk-evaluation project (Vite + React + TypeScript + Tailwind).

## Migration Summary
- Branch: `chore/migrate-to-vitest` — migration of unit tests from Jest to Vitest.
- Added: Vitest configuration for fast local/CI runs, Playwright E2E skeleton with Axe accessibility checks, and branch CI workflow to validate the migration before switching `main`.

## How to run locally

Install dependencies:

```powershell
npm ci
```

Run dev server:

```powershell
npm run dev
```

Build production:

```powershell
npm run build
npm run compress:dist   # optional: create .gz and .br artifacts for dist
```

## Tests

- Unit (Vitest):

```powershell
npx vitest --config vitest.config.cjs --run
```

- Legacy Jest commands are preserved on `main` but the migration branch uses Vitest.

- E2E (Playwright) — skeleton added:

```powershell
npm run test:e2e
npx playwright install --with-deps
```

Note: Playwright and Axe are listed as optional dependencies; install them if you plan to run E2E locally.

## CI Workflows

- `.github/workflows/vitest-migration.yml` — runs on `chore/migrate-to-vitest` (Vitest + build + compressed artifact upload). It now supports `workflow_dispatch` for manual runs.
- `.github/workflows/e2e.yml` — Playwright E2E workflow (manual dispatch + push triggers for `chore/migrate-to-vitest` and `main`).

If Actions show no runs, ensure repository Actions are allowed in Settings → Actions → General.

## Bundle size & next steps

- `recharts` and `react` vendor chunks are the largest contributors; three charts were lazy-loaded to reduce initial payload.
- Next options to further reduce bundle size:
  - Replace `recharts` with a lighter charting library (e.g., `chart.js` + `react-chartjs-2`) for smaller vendor size.
  - Further manual chunk splitting in `vite.config.ts`.
  - Remove unused Tailwind classes (purge already narrowed to `./src/**/*.{ts,tsx,js,jsx}`).

## How I can help next
- Monitor CI runs and fetch artifacts (I can use a GitHub PAT or you can paste run URLs).
- Implement Playwright tests for critical flows and expand Axe/Lighthouse checks in CI.
- Propose and implement a `recharts` -> `react-chartjs-2` migration with examples.

If you want me to proceed with any of the next steps, tell me which and I'll implement it.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
