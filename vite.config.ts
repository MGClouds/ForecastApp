import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
  base: '/ForecastApp/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
