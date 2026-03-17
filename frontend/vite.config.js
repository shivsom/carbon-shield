import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  

export default defineConfig({
  plugins: [react()],  
  base: '/carbon-shield/',   // ← IMPORTANT: your repo name in lowercase
})

