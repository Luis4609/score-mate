/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true, // Por ejemplo, para no importar describe, it, expect
    environment: 'jsdom', // Si estás probando componentes de UI (React, Vue, etc.)
  },
});
