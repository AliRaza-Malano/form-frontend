import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Properly merged config
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // or '0.0.0.0' to allow mobile access
  },
});
