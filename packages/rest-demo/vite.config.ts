import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ["@vite/client", "@vite/env", "@vlcn.io/crsqlite-wasm"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  plugins: [
    react(),
    // VitePWA({
    //   workbox: {
    //     globPatterns: [
    //       "**/*.js",
    //       "**/*.css",
    //       "**/*.svg",
    //       "**/*.html",
    //       "**/*.png",
    //       "**/*.wasm",
    //     ],
    //   },
    // }),
  ],
  server: {
    fs: {
      strict: false,
    },
  },
});
