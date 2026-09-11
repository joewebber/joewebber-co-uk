import { defineConfig, loadEnv } from "vite";
import posthog from "@posthog/rollup-plugin";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

// Static multi-page build: every HTML entry point needs to be listed here
// explicitly, or Vite's production build will only emit index.html. Add
// each new article's index.html to this list as it's created — article.html
// at the root is just a scaffold to duplicate and stays out of the build.
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return defineConfig({
    plugins: [
      posthog({
        personalApiKey: process.env.POSTHOG_API_KEY,
        projectId: process.env.POSTHOG_PROJECT_ID,
        host: process.env.POSTHOG_HOST,
      }),
    ],
    build: {
      rollupOptions: {
        input: {
          main: root + "index.html",
          "choosing-your-career-path": root + "articles/choosing-your-career-path/index.html",
        },
      },
    },
  });
};
