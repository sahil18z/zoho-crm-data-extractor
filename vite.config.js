import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        content: resolve(__dirname, "src/content/index.js")
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") {
            return "content/index.js";
          }
          return "assets/[name]-[hash].js";
        }
      }
    }
  }
});

