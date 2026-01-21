// Platform detection utilities

export type SupportedPlatform = "chatgpt" | "claude";

export interface PlatformInfo {
  name: string;
  domain: string;
  selectors: {
    messages: string[];
    input: string[];
    response: string[];
  };
  tokenEstimation: {
    factor: number; // tokens per character
    baseTokens: number; // base tokens per request
  };
}

export const PLATFORM_CONFIGS: Record<SupportedPlatform, PlatformInfo> = {
  chatgpt: {
    name: "ChatGPT",
    domain: "chatgpt.com",
    selectors: {
      messages: [
        "[data-message-author-role='assistant']",
        "[data-message-author-role='user']",
        "[data-testid='conversation-turn-3']",
        "[data-testid='conversation-turn-4']",
      ],
      input: ["#prompt-textarea", "[data-testid='textbox']"],
      response: ["[data-message-author-role='assistant']"],
    },
    tokenEstimation: {
      factor: 0.25, // ~4 characters per token
      baseTokens: 10,
    },
  },
  claude: {
    name: "Claude",
    domain: "claude.ai",
    selectors: {
      messages: [
        '[data-testid="message"]',
        ".claude-message",
        '[class*="message"]',
        '[class*="conversation"]',
        '[class*="chat"]',
      ],
      input: [
        '[data-testid="composer-input"]',
        'textarea[placeholder*="Message"]',
      ],
      response: ['[data-testid="message"]'],
    },
    tokenEstimation: {
      factor: 0.25, // ~4 characters per token
      baseTokens: 10,
    },
  },
};

// Detect current platform
export const detectPlatform = (): SupportedPlatform | null => {
  const hostname = window.location.hostname;

  if (hostname.includes("chatgpt")) return "chatgpt";
  if (hostname.includes("claude")) return "claude";
  return null;
};

// Get platform configuration
export const getPlatformConfig = (
  platform: SupportedPlatform
): PlatformInfo => {
  return PLATFORM_CONFIGS[platform];
};

// Get current platform configuration
export const getCurrentPlatformConfig = (): PlatformInfo | null => {
  const platform = detectPlatform();
  return platform ? getPlatformConfig(platform) : null;
};

// Check if current page is supported
export const isSupportedPlatform = (): boolean => {
  return detectPlatform() !== null;
};

// Get platform name for display
export const getPlatformDisplayName = (platform: SupportedPlatform): string => {
  return PLATFORM_CONFIGS[platform].name;
};
