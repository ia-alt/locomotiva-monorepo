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
      "@backend": path.resolve(__dirname, "../secti-locomotiva/src/modules"),
      "@core": path.resolve(__dirname, "../secti-locomotiva/src/modules/_core"),
      "@di": path.resolve(__dirname, "../secti-locomotiva/src/modules/_di_container"),
      "@booking": path.resolve(__dirname, "../secti-locomotiva/src/modules/booking"),
      "@coworking": path.resolve(__dirname, "../secti-locomotiva/src/modules/coworking"),
      "@identy": path.resolve(__dirname, "../secti-locomotiva/src/modules/identity"),
      "@notifications": path.resolve(__dirname, "../secti-locomotiva/src/modules/notifications"),
      "@operating-hours": path.resolve(__dirname, "../secti-locomotiva/src/modules/operating-hours"),
      "@env": path.resolve(__dirname, "../secti-locomotiva/src/modules/env.ts"),
      "src/modules": path.resolve(__dirname, "../secti-locomotiva/src/modules"),
    }
  }
})
