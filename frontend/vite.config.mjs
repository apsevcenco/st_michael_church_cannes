import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dirname;
const htmlEntries = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith(".html"))
    .map((file) => [file.replace(/\.html$/, ""), resolve(root, file)])
);

export default defineConfig({
  root,
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntries
    }
  }
});
