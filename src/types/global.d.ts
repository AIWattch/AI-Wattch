// Global type declarations for Chrome extension APIs

declare global {
  interface Window {
    chrome: typeof chrome;
    aiWatchInitialized?: boolean;
  }
}

// Ensure Chrome types are available
import "chrome";

export {};
