import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Default to root for Vercel, use subpath for GitHub Pages
  base: process.env.IS_GHPAGES ? '/OptiRoute/' : '/',
})
