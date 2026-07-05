import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable, rarely-changing vendor code from app code so browsers
        // can cache it across deploys instead of re-downloading it whenever
        // any app file changes (route-level chunks already split by main.jsx's
        // React.lazy() calls — this only affects the shared/vendor layer).
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "framer-motion",
            "@radix-ui/react-select",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-icons",
            "lucide-react",
          ],
        },
      },
    },
  },
});
