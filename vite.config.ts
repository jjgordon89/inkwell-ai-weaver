import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // sql.js WASM support
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  define: {
    // Ensure proper handling of Node.js globals for sql.js
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  // Ensure WASM files are served correctly
  assetsInclude: ['**/*.wasm'],
  worker: {
    format: 'es',
  },
}));
