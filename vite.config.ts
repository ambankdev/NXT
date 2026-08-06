import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    // Source locator injects browser-only tracking attributes — skip it for the
    // prerender bundle so the server render matches the client one.
    ...(isSsrBuild ? [] : [viteSourceLocator({ prefix: "mgx" })]),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
