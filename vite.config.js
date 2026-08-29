import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

// Static multi-page build: every top-level HTML entry point needs to be
// listed here explicitly, or Vite's production build will only emit
// index.html. Add new article pages to this list as they're created.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: root + "index.html",
        article: root + "article.html",
      },
    },
  },
});
