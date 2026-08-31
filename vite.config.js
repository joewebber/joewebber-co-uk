import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

// Static multi-page build: every HTML entry point needs to be listed here
// explicitly, or Vite's production build will only emit index.html. Add
// each new article's index.html to this list as it's created — article.html
// at the root is just a scaffold to duplicate and stays out of the build.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: root + "index.html",
        "choosing-your-career-path": root + "articles/choosing-your-career-path/index.html",
      },
    },
  },
});
