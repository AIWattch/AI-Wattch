import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// @ts-ignore
const TARGET_BROWSER = process?.env?.TARGET_BROWSER || "chrome";
console.log(`Building for target browser: ${TARGET_BROWSER}`);

export default defineConfig({
  // @ts-ignore
  // Enable this in prod build for stores
  // esbuild: {
  //   drop: ["console", "debugger"],
  // },
  plugins: [react(), crx({ manifest, browser: TARGET_BROWSER })],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
