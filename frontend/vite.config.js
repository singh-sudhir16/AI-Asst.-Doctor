import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensures build files go into "dist"
  },
  server: {
    host: true,  // or '0.0.0.0'
  },
  base: "/", // Makes sure assets load correctly
});
