// Model detection utilities

import { DEFAULT_DETECTION_MODEL, LLM_MODELS } from "../../constants";
import { ModelInfo } from "../../shared/types";

import { updateSelectedModel } from "../storage";
import { SupportedPlatform } from "./platform";

const MODEL_SELECTORS_BUTTON = {
  chatgpt: "",
  claude: "[data-testid='model-selector-dropdown']",
};

// Model detection selectors for different platforms
const MODEL_SELECTORS = {
  chatgpt: [
    // Model switcher button
    '[data-testid="model-selector"]',
    '[aria-label*="model"]',
    '[title*="GPT"]',
    // Model name in header
    'button[aria-label*="GPT"]',
    'div[data-testid="model-name"]',
    // Model indicator in conversation
    '[data-testid="conversation-header"] button',
    // Settings or model info
    '[data-testid="settings-button"] + div',
    // Look for text containing model names
    'button:has-text("GPT-4")',
    'button:has-text("GPT-3.5")',
  ],
  claude: [
    // Model switcher
    '[data-testid="model-selector"]',
    '[aria-label*="model"]',
    '[title*="Claude"]',
    // Model name in header
    'button[aria-label*="Claude"]',
    'div[data-testid="model-name"]',
    // Model indicator
    '[data-testid="conversation-header"] button',
    // Settings area
    '[data-testid="settings-button"] + div',
    // Look for text containing model names
    'button:has-text("Claude 3.5")',
    'button:has-text("Claude 3")',
    'button:has-text("Claude 2")',
  ],
};

// Known model patterns
const MODEL_PATTERNS = {
  chatgpt: [
    { pattern: /GPT-4(?!\w)/i, name: "GPT-4", id: "gpt-4" },
    { pattern: /GPT-4o/i, name: "GPT-4o", id: "gpt-4o" },
    { pattern: /GPT-4-turbo/i, name: "GPT-4 Turbo", id: "gpt-4-turbo" },
    { pattern: /GPT-3\.5/i, name: "GPT-3.5", id: "gpt-3.5-turbo" },
    { pattern: /GPT-3/i, name: "GPT-3", id: "gpt-3" },
  ],
  claude: [
    {
      pattern: /Claude 3\.5/i,
      name: "Claude 3.5 Sonnet",
      id: "claude-3-5-sonnet",
    },
    {
      pattern: /Claude 3\.5 Sonnet/i,
      name: "Claude 3.5 Sonnet",
      id: "claude-3-5-sonnet",
    },
    {
      pattern: /Claude 3\.5 Haiku/i,
      name: "Claude 3.5 Haiku",
      id: "claude-3-5-haiku",
    },
    {
      pattern: /Claude 3\.5 Opus/i,
      name: "Claude 3.5 Opus",
      id: "claude-3-5-opus",
    },
    { pattern: /Claude 3/i, name: "Claude 3", id: "claude-3" },
    { pattern: /Claude 2/i, name: "Claude 2", id: "claude-2" },
  ],
};

// Detect model for ChatGPT
const detectChatGPTModel = (): ModelInfo | null => {
  // Try to find model selector or model name

  let modelInfo = DEFAULT_DETECTION_MODEL.chatgpt;

  // Select the button using its test ID (most reliable)
  const btn = document.querySelector(
    '[data-testid="model-switcher-dropdown-button"]'
  );

  // Find the <span> that contains the model number inside it
  const modelSpan = btn?.querySelector("span.text-token-text-tertiary");

  // Extract the text content
  const modelVersion = modelSpan?.textContent?.trim();

  const searchModel = LLM_MODELS.find(
    (model) =>
      model.platform === "chatgpt" &&
      model.detectionName?.split(",").some((a) => a === modelVersion)
  );

  console.log(
    "Detected ChatGPT model version text:",
    searchModel,
    modelVersion
  );

  if (searchModel) {
    modelInfo = searchModel;
  }

  updateSelectedModel({ ...modelInfo, autoDetected: true }).then(() => {
    console.log("AI Wattch: Model info updated", modelInfo);
  });

  // Default fallback
  return { ...modelInfo, autoDetected: true };
};

// Detect model for Claude
const detectClaudeModel = (): ModelInfo | null => {
  // Try to find model selector or model name
  const container = document.querySelector(
    MODEL_SELECTORS_BUTTON.claude
  ) as HTMLElement;

  let modelInfo = DEFAULT_DETECTION_MODEL.claude;

  if (container) {
    const target = Array.from(container.querySelectorAll("div")).find(
      (div: HTMLElement) => {
        const classList = div.classList;

        return (
          (classList.contains("whitespace-nowrap") &&
            classList.contains("select-none")) ||
          (classList.contains("tracking-tight") &&
            classList.contains("whitespace-nowrap") &&
            classList.contains("select-none"))
        );
      }
    );

    if (target) {
      const text = target.textContent?.trim();
      const model = LLM_MODELS.find(
        (model) => model.detectionName === text && model.platform === "claude"
      );
      if (text && model) {
        modelInfo = model;
        // updateSelectedModel(model);
      }

      console.log("Found text:", text);
    } else {
      console.log("Target div not found inside container.");
    }
  } else {
    console.log("Container not found.");
  }

  updateSelectedModel({ ...modelInfo, autoDetected: true }).then(() => {
    console.log("AI Wattch: Model info updated", modelInfo);
  });
  // Default fallback
  return { ...modelInfo, autoDetected: true };
};

// Main model detection function
// export const detectCurrentModel = (
//   platform: SupportedPlatform
// ): ModelInfo | null => {
//   switch (platform) {
//     case "chatgpt":
//       return detectChatGPTModel();
//     case "claude":
//       return detectClaudeModel();
//     default:
//       return null;
//   }
// };

// Detect model with platform auto-detection
export const detectModel = (): ModelInfo | null => {
  const hostname = window.location.hostname;

  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
    console.log("Detecting ChatGPT model");
    return detectChatGPTModel();
  } else if (hostname.includes("claude.ai")) {
    console.log("Detecting Claude model");
    return detectClaudeModel();
  }

  return null;
};

// Get model display name
export const getModelDisplayName = (model: ModelInfo): string => {
  return model.modelName;
};

// Check if model is detected
export const isModelDetected = (): boolean => {
  return detectModel() !== null;
};
