import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    proxy: {
      "/api": {
        target: "http://23.27.186.171:4111",
        changeOrigin: true,
      },
    },
  },
});
