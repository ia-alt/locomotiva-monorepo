import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@backend": path.resolve(__dirname, "../api/src/modules"),
      "@core": path.resolve(__dirname, "../api/src/modules/_core"),
      "@di": path.resolve(__dirname, "../api/src/modules/_di_container"),
      "@booking": path.resolve(__dirname, "../api/src/modules/booking"),
      "@coworking": path.resolve(__dirname, "../api/src/modules/coworking"),
      "@identy": path.resolve(__dirname, "../api/src/modules/identity"),
      "@notifications": path.resolve(__dirname, "../api/src/modules/notifications"),
      "@operating-hours": path.resolve(__dirname, "../api/src/modules/operating-hours"),
      "@env": path.resolve(__dirname, "../api/src/modules/env.ts"),
      "src/modules": path.resolve(__dirname, "../api/src/modules"),
    }
  }
})
