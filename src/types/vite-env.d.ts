// src/vite-env.d.ts

/// <reference types="vite/client" />

// This tells TypeScript that importing .css with ?inline gives a string
declare module "*.css?inline" {
  const css: string;
  export default css;
}
