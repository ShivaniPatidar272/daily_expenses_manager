import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config — https://vitejs.dev/config/
//
// The site is served from the domain root by default ("/"), which is what
// Cloudflare Pages, Netlify, Vercel and local development all need.
// Hosts that serve the site from a sub-path (e.g. GitHub Pages project sites at
// /<repo-name>/) set VITE_BASE_PATH at build time — see .github/workflows/deploy.yml.
function resolveBase(): string {
  const configured = process.env.VITE_BASE_PATH?.trim()
  if (!configured || configured === '/') return '/'
  return `/${configured.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
})
