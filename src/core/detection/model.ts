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

const detectGeminiModel = (): ModelInfo | null => {
  let modelInfo = DEFAULT_DETECTION_MODEL.gemini;

  const btn = document.querySelector<HTMLElement>(
    'button[data-test-id="bard-mode-menu-button"]',
  );

  if (!btn) {
    return { ...modelInfo, autoDetected: true };
  }

  const menuSelector = '[data-test-id="bard-mode-desktop-gem-menu"]';

  const getModelFromLabel = (label: string): ModelInfo | null => {
    const normalizedLabel = label.replace(/\s+/g, " ").trim();

    return (
      LLM_MODELS.find(
        (model) =>
          model.platform === "gemini" &&
          model.modelName === `Gemini ${normalizedLabel}`,
      ) || null
    );
  };

  const updateModel = (label: string) => {
    const matchedModel = getModelFromLabel(label);

    if (!matchedModel) {
      console.log("AI Wattch: Gemini model not found:", label);
      return;
    }

    modelInfo = matchedModel;

    updateSelectedModel({
      ...matchedModel,
      autoDetected: true,
    }).then(() => {
      console.log("AI Wattch: Gemini model updated:", matchedModel);
    });
  };

  /*
   * ---------------------------------------------------------
   * 1. Install the user-selection listener ONLY ONCE
   * ---------------------------------------------------------
   */

  if (btn.dataset.aiwattchGeminiListener !== "true") {
    btn.dataset.aiwattchGeminiListener = "true";

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element | null;

        const option = target?.closest('[data-test-id^="bard-mode-option-"]');

        if (!option) {
          return;
        }

        const label = option.querySelector(".label")?.textContent?.trim() || "";

        if (!label) {
          return;
        }

        /*
         * Capture the model BEFORE Gemini closes/removes
         * the dropdown.
         */
        updateModel(label);
      },
      true,
    );
  }

  /*
   * ---------------------------------------------------------
   * 2. If the menu is already open, NEVER click the button
   * ---------------------------------------------------------
   */

  const existingMenu = document.querySelector(menuSelector);

  if (existingMenu) {
    const selectedModel = existingMenu.querySelector(
      '[data-test-id^="bard-mode-option-"].selected',
    );

    const label =
      selectedModel?.querySelector(".label")?.textContent?.trim() || "";

    if (label) {
      updateModel(label);
    }

    return {
      ...modelInfo,
      autoDetected: true,
    };
  }

  /*
   * ---------------------------------------------------------
   * 3. Initial detection only
   *
   * This is the ONLY place where we click the Gemini button.
   *
   * The DOM dataset flag survives repeated calls to this
   * function, so calling this function every second cannot
   * keep opening/closing the menu.
   * ---------------------------------------------------------
   */

  if (btn.dataset.aiwattchGeminiInitialDetection === "true") {
    return {
      ...modelInfo,
      autoDetected: true,
    };
  }

  btn.dataset.aiwattchGeminiInitialDetection = "true";

  /*
   * Mark that WE opened the menu.
   */
  btn.dataset.aiwattchGeminiOpenedByDetector = "true";

  /*
   * Open exactly once.
   */
  btn.click();

  /*
   * Wait for Angular/CDK to render the menu.
   */
  const observer = new MutationObserver(() => {
    const menu = document.querySelector(menuSelector);

    if (!menu) {
      return;
    }

    observer.disconnect();

    const selectedModel = menu.querySelector(
      '[data-test-id^="bard-mode-option-"].selected',
    );

    const label =
      selectedModel?.querySelector(".label")?.textContent?.trim() || "";

    if (label) {
      updateModel(label);
    }

    /*
     * IMPORTANT:
     * Only close the menu if WE opened it.
     *
     * If the user has already interacted with the menu,
     * don't touch it.
     */
    setTimeout(() => {
      const currentMenu = document.querySelector(menuSelector);

      const openedByDetector =
        btn.dataset.aiwattchGeminiOpenedByDetector === "true";

      if (currentMenu && openedByDetector) {
        btn.click();
      }

      delete btn.dataset.aiwattchGeminiOpenedByDetector;
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  /*
   * Safety cleanup.
   */
  setTimeout(() => {
    observer.disconnect();

    delete btn.dataset.aiwattchGeminiOpenedByDetector;
  }, 2000);

  return {
    ...modelInfo,
    autoDetected: true,
  };
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
      const text = target.textContent?.trim();
      const model = LLM_MODELS.find(
        (model) =>
          text.includes(model.detectionName) && model.platform === "claude",
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
