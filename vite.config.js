import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ignore the preserved, inactive prototype under tmp/ during dev pre-bundling.
  optimizeDeps: { entries: ['index.html'] },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
