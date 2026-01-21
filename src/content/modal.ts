import React from "react";
import ReactDOM from "react-dom/client";
import { Popup } from "../modules/MainPopup";
import styles from "../index.css?inline";

// Types
interface ModalState {
  container: HTMLElement | null;
  shadowRoot: ShadowRoot | null;
  reactRoot: ReactDOM.Root | null;
  isOpen: boolean;
}

// Constants
const MODAL_CONFIG = {
  elementId: "ai-watch-modal",
  elementTag: "ai-watch-modal",
  fontWeights: [400, 500, 600, 700],
  animationDuration: 200,
} as const;

// Global state
const modalState: ModalState = {
  container: null,
  shadowRoot: null,
  reactRoot: null,
  isOpen: false,
};

// Font management
const loadedWeights = new Set<number>();

const preloadFonts = async (weights: readonly number[]): Promise<void> => {
  const unloadedWeights = weights.filter(
    (weight) => !loadedWeights.has(weight)
  );

  if (unloadedWeights.length === 0) {
    console.log("AI Watch: All requested fonts already loaded");
    return;
  }

  try {
    const fontPromises = unloadedWeights.map(async (weight) => {
      const fontUrl = chrome.runtime.getURL(
        `src/assets/fonts/Outfit-${weight}.ttf`
      );
      const font = new FontFace("Outfit", `url("${fontUrl}")`, {
        weight: weight.toString(),
        display: "swap",
      });

      await font.load();
      document.fonts.add(font);
      loadedWeights.add(weight);
      console.log(`AI Watch: Font weight ${weight} loaded`);
    });

    await Promise.all(fontPromises);
    console.log("AI Watch: All fonts loaded successfully");
  } catch (error) {
    console.error("AI Watch: Font loading error:", error);
    // Continue without custom fonts
  }
};

// Shadow DOM management
const createStyledShadowRoot = async (
  container: HTMLElement
): Promise<ShadowRoot> => {
  const shadowRoot = container.attachShadow({ mode: "open" });

  try {
    // Load fonts first
    await preloadFonts(MODAL_CONFIG.fontWeights);

    // Create and apply component stylesheet
    const componentSheet = new CSSStyleSheet();
    // await componentSheet.replace(styles);

    // shadowRoot.adoptedStyleSheets = [componentSheet];

    shadowRoot.innerHTML = createModalStyles();

    console.log("AI Watch: Shadow DOM styles applied successfully");
  } catch (error) {
    console.error("AI Watch: Failed to apply shadow DOM styles:", error);
    // Fallback to inline styles
    applyFallbackStyles(shadowRoot);
  }

  return shadowRoot;
};

const createModalStyles = (): string => `
  <style>
    ${styles}
  </style>
`;

const applyFallbackStyles = (shadowRoot: ShadowRoot): void => {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
  console.log("AI Watch: Applied fallback inline styles");
};

// Event management
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

const addEscapeListener = (callback: () => void): void => {
  removeEscapeListener(); // Clean up any existing listener

  escapeHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      console.log("AI Watch: Escape key pressed");
      callback();
    }
  };

  document.addEventListener("keydown", escapeHandler);
};

const removeEscapeListener = (): void => {
  if (escapeHandler) {
    document.removeEventListener("keydown", escapeHandler);
    escapeHandler = null;
  }
};

// Animation helpers
const fadeOutElement = async (
  element: HTMLElement,
  duration: number = MODAL_CONFIG.animationDuration
): Promise<void> => {
  element.style.animation = `modalSlideOut ${duration}ms ease-in`;
  return new Promise((resolve) => setTimeout(resolve, duration - 100));
};

// Cleanup function
const cleanup = async (): Promise<void> => {
  // Remove event listeners
  removeEscapeListener();

  // Unmount React
  if (modalState.reactRoot) {
    modalState.reactRoot.unmount();
  }

  // Remove DOM element
  if (modalState.container?.parentNode) {
    modalState.container.parentNode.removeChild(modalState.container);
  }

  // Reset state
  modalState.container = null;
  modalState.shadowRoot = null;
  modalState.reactRoot = null;
  modalState.isOpen = false;
};

// Main modal functions
const createModal = async (): Promise<void> => {
  if (modalState.isOpen) {
    console.warn("AI Watch: Modal already open");
    return;
  }

  try {
    console.log("AI Watch: Creating modal with Shadow DOM");

    // Create container element
    modalState.container = document.createElement(MODAL_CONFIG.elementTag);
    modalState.container.id = MODAL_CONFIG.elementId;

    // Create styled Shadow DOM
    modalState.shadowRoot = await createStyledShadowRoot(modalState.container);

    // Create modal content container
    const modalContent = document.createElement("div");
    // modalContent.className = "modal-content";
    modalState.shadowRoot.appendChild(modalContent);

    // Add to document
    document.body.appendChild(modalState.container);

    // Create React root and render
    modalState.reactRoot = ReactDOM.createRoot(modalContent);
    modalState.reactRoot.render(React.createElement(Popup));

    // Add escape key listener
    addEscapeListener(removeModal);

    // Update state
    modalState.isOpen = true;

    console.log("AI Watch: Modal created successfully");
  } catch (error) {
    console.error("AI Watch: Failed to create modal:", error);
    await cleanup();
    throw error;
  }
};

const removeModal = async (): Promise<void> => {
  if (!modalState.isOpen || !modalState.container) {
    console.warn("AI Watch: No modal to remove");
    return;
  }

  try {
    console.log("AI Watch: Removing modal");

    // Animate out if possible
    const modalContent = modalState.shadowRoot?.querySelector(
      ".modal-content"
    ) as HTMLElement;

    if (modalContent) {
      await fadeOutElement(modalContent);
    }

    // Clean up
    await cleanup();

    console.log("AI Watch: Modal removed successfully");
  } catch (error) {
    console.error("AI Watch: Error removing modal:", error);
    // Force cleanup even if animation fails
    await cleanup();
  }
};

// Utility functions
const isModalOpen = (): boolean => modalState.isOpen;

const toggleModal = async (): Promise<void> => {
  if (isModalOpen()) {
    await removeModal();
  } else {
    await createModal();
  }
};

// Development helpers (only in dev mode)
const getModalState = () => ({ ...modalState });
const getLoadedFonts = () => Array.from(loadedWeights);

// Export functions
export {
  createModal,
  removeModal,
  isModalOpen,
  toggleModal,
  // Development exports
  getModalState,
  getLoadedFonts,
  cleanup,
};

// Add to window for debugging in development

(window as any).aiWatchModal = {
  getState: getModalState,
  getLoadedFonts,
  cleanup,
  preloadFonts,
};
