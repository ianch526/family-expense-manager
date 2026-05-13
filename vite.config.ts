import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 從環境變數讀 base path，部署到 GitHub Pages 子路徑時設定
// 例如 VITE_BASE_PATH=/family-expense-manager/
const BASE = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
