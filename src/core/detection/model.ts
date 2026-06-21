// Model detection utilities

import { DEFAULT_DETECTION_MODEL, LLM_MODELS } from "../../constants";
import { ModelInfo } from "../../shared/types";

import { updateSelectedModel } from "../storage";

const MODEL_SELECTORS_BUTTON = {
  chatgpt: "",
  claude: "[data-testid='model-selector-dropdown']",
  gemini: "",
};

// Detect model for ChatGPT
const detectChatGPTModel = (): ModelInfo | null => {
  // Try to find model selector or model name

  let modelInfo = DEFAULT_DETECTION_MODEL.chatgpt;

  // Select the button using its test ID (most reliable)
  const btn = document.querySelector(
    '[data-testid="model-switcher-dropdown-button"]',
  );

  // Find the <span> that contains the model number inside it
  const modelSpan = btn?.querySelector("span.text-token-text-tertiary");

  // Extract the text content
  const modelVersion = modelSpan?.textContent?.trim();

  const searchModel = LLM_MODELS.find(
    (model) =>
      model.platform === "chatgpt" &&
      model.detectionName?.split(",").some((a) => a === modelVersion),
  );

  console.log(
    "Detected ChatGPT model version text:",
    searchModel,
    modelVersion,
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

// Detect model for Gemini
const detectGeminiModel = (): ModelInfo | null => {
  let modelInfo = DEFAULT_DETECTION_MODEL.gemini;

  // Target ONLY the correct button
  const btn = document.querySelector(
    'button[data-test-id="bard-mode-menu-button"]',
  );

  const text = btn?.textContent?.trim() || "";

  console.log(text, "texxtttttttttttt");

  if (text.includes("Pro")) {
    const proModel = LLM_MODELS.find(
      (m) => m.platform === "gemini" && m.modelName.includes("Gemini 3.1 Pro"),
    );
    if (proModel) modelInfo = proModel;
  }

  updateSelectedModel({ ...modelInfo, autoDetected: true }).then(() => {
    console.log("AI Wattch: Model info updated", modelInfo);
  });

  return { ...modelInfo, autoDetected: true };
};
// Detect model for Claude
const detectClaudeModel = (): ModelInfo | null => {
  // Try to find model selector or model name
  const container = document.querySelector(
    MODEL_SELECTORS_BUTTON.claude,
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
      },
    );

    if (target) {
      const raw = target.textContent?.trim() ?? "";
      // claude.ai may render "Claude Sonnet 4.6" or just "Sonnet 4.6"
      const text = raw.replace(/^Claude\s+/i, "");
      const model = LLM_MODELS.find(
        (model) => model.detectionName === text && model.platform === "claude",
      );
      if (text && model) {
        modelInfo = model;
      }

      console.log("Found text:", raw, "→ normalised:", text);
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

// Detect model with platform auto-detection
export const detectModel = (): ModelInfo | null => {
  const hostname = window.location.hostname;

  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
    console.log("Detecting ChatGPT model");
    return detectChatGPTModel();
  } else if (hostname.includes("claude.ai")) {
    console.log("Detecting Claude model");
    return detectClaudeModel();
  } else if (hostname.includes("gemini.google.com")) {
    console.log("Detecting Gemini model");
    return detectGeminiModel();
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
