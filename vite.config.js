import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Anything starting with /carapi will be forwarded to https://carapi.app
      "/carapi": {
        target: "https://carapi.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/carapi/, ""),
      },
    },
  },
});
