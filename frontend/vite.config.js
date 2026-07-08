import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite serves the React app locally and builds static assets for Vercel.
export default defineConfig({
  // The React plugin enables JSX transformation and Fast Refresh during development.
  plugins: [react()],
})
