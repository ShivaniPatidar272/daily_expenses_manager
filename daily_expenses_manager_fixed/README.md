# Daily Expense Manager

A personal expense tracker built with React, TypeScript, Vite and Tailwind CSS (originally generated with Figma Make).
Everything runs in the browser: your data is saved in `localStorage` on your own device. There is no server, login or database.

## Features

- Dashboard: today / week / month / year totals, expense overview chart (weekly, monthly, yearly), spending by category, top categories, recent expenses, monthly comparison
- Add expenses: date defaults to today (changeable), several items per expense, product autocomplete from previous entries, optional category, amounts in ₹ (INR)
- Expense history: search, filters (dates, category, product, amount), view / edit / delete, CSV export
- Categories: add, rename, delete (renaming updates your history)
- Products: saved product library used for autocomplete, add / rename / remove
- Reports: week / month / year / custom range, average per day, highest day, top category and product, charts
- Settings: your name, JSON backup download and restore, delete all data
- Works on desktop and mobile

## Run it on your computer

You need [Node.js 22](https://nodejs.org) and [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`).

```bash
pnpm install          # install dependencies (uses pnpm-lock.yaml)
pnpm dev              # start the dev server, then open the URL it prints
pnpm typecheck        # check the TypeScript
pnpm build            # production build into dist/
pnpm preview          # serve the production build locally
```

Locally the app runs at `/`. The build uses the base path `/` by default, which is what Cloudflare Pages, Netlify and Vercel need.
Hosts that serve from a sub-path (such as GitHub Pages) set `VITE_BASE_PATH` at build time, e.g. `VITE_BASE_PATH=/my-repo/ pnpm build`.

## Deploy to Cloudflare Pages

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** and pick your repository.
2. If the project files are inside a subfolder of the repo (for example `daily_expenses_manager_fixed/`), set **Root directory** to that folder.
3. Build settings:
   - **Framework preset:** None (or "Vite")
   - **Build command:** `pnpm run build`
   - **Build output directory:** `dist`
4. Environment variable (recommended): `NODE_VERSION` = `22`.
5. Save and deploy. No other configuration is needed. The site is served from the root of your `*.pages.dev` address.

If you get "page can't be found" (404), the build output directory is wrong or the build failed. Open the deployment's build log in Cloudflare.

## Deploy to GitHub Pages (optional)

The workflow in `.github/workflows/deploy.yml` installs dependencies with pnpm, type-checks, builds (with the base path set to `/<repository-name>/`), and publishes `dist`.
GitHub only runs workflows located in the **repository root** `.github/workflows/` folder, and the workflow assumes the project is at the repository root.

1. Put this project at the repository root and push to `main`.
2. **Settings → Pages → Source: GitHub Actions**.
3. Wait for the "Deploy to GitHub Pages" run in the **Actions** tab, then open `https://<your-username>.github.io/<repository-name>/`.

> Do not use "Deploy from a branch" for this project: that serves the raw source `index.html`, which browsers cannot run, giving a blank page.

## Uploading to your existing repository

**Using the GitHub website (no git needed)**
1. Unzip this project.
2. Open https://github.com/ShivaniPatidar272/daily_expenses_manager and click **Add file → Upload files**.
3. Drag in **everything inside the unzipped folder**, including the hidden `.github` folder (the optional `.figma` folder is not needed). If your file picker hides folders starting with a dot, enable "show hidden files" first (Mac: `Cmd+Shift+.`, Windows: View → Show → Hidden items).
4. Commit directly to `main`.

**Using git**
```bash
git clone https://github.com/ShivaniPatidar272/daily_expenses_manager.git
cd daily_expenses_manager
# copy the project files over the clone (including the hidden .github folder), then:
git add -A
git commit -m "Fix GitHub Pages deployment and make the expense manager functional"
git push origin main
```

Then connect the repository to Cloudflare Pages (or enable GitHub Pages) as described above.

## Project structure

```
index.html                    HTML shell (mounts #root, loads src/main.tsx)
vite.config.ts                Vite config (React, Tailwind, "@" alias, base path)
.github/workflows/deploy.yml  Optional: build + deploy to GitHub Pages
src/main.tsx                  Entry point (with an error boundary)
src/App.tsx                   App shell, navigation, drawers
src/store.tsx                 App state + automatic saving to localStorage
src/pages/                    Dashboard, AddExpense, Expenses, Categories, Products, Reports, Settings
src/components/               Shared UI (buttons, inputs, modals, charts)
src/lib/                      Dates, INR formatting, statistics, filters, storage + validation
src/index.css                 Styles
```

## Your data

Data lives in your browser's `localStorage` (key `daily-expenses-manager:v1`). Clearing site data or using a different browser/device
starts empty. Use **Settings → Download backup** regularly, and **Restore from backup** to move data between devices.

## Testing checklist (manual)

1. Add an expense with two items, then refresh the page. It should still be there.
2. Type `mi` in a product field after saving "Milk": Milk should be suggested.
3. Edit an expense from **Expenses**, then delete another one.
4. Rename a category and confirm your history shows the new name.
5. Open Reports and switch between Week / Month / Year.
