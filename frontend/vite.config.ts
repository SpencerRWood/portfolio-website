import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/content": process.env.BACKEND_PROXY_TARGET ?? "http://localhost:8000",
      "/contact": process.env.BACKEND_PROXY_TARGET ?? "http://localhost:8000",
      "/health": process.env.BACKEND_PROXY_TARGET ?? "http://localhost:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
});
