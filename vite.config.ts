import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// `base: './'` makes all asset paths relative, so the built site works whether
// it's served from a domain root or from a GitHub Pages sub-path
// (https://<user>.github.io/<repo>/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
