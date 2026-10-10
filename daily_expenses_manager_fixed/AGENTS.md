# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` (inside an error boundary) into the `#root` element
- `src/App.tsx` - App shell: navigation, top bar, detail drawer; wraps everything in `StoreProvider`
- `src/store.tsx` - App state (reducer) with automatic `localStorage` persistence (key `daily-expenses-manager:v1`)
- `src/pages/` - One file per screen: Dashboard, AddExpense, Expenses, Categories, Products, Reports, Settings, ExpenseDetail
- `src/components/` - Shared UI (`ui.tsx`: Icon, Button, inputs, Modal) and charts (`charts.tsx`)
- `src/lib/` - Pure logic: dates, INR formatting, statistics, filters, storage/validation
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, typecheck, and formatting scripts
- `vite.config.ts` - Vite configuration with React and Tailwind CSS v4 plugins and the `@` alias for `src`. Base path is `/` unless `VITE_BASE_PATH` is set (GitHub Pages workflow sets it). It does not depend on `.figma/`
- `.github/workflows/deploy.yml` - GitHub Pages deployment (pnpm install, typecheck, build, publish `dist`)
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
