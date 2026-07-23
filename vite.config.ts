import { defineConfig } from "vite";

export default defineConfig({
  base: "/multiverse-nexus/",
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
