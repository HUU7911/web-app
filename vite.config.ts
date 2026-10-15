import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gateway cho phép CORS từ http://localhost:5173 và http://localhost:3000
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
