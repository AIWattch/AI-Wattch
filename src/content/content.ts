// Content script for monitoring AI usage across different platforms

import {
  detectPlatform,
  isSupportedPlatform,
  getCurrentPlatformConfig,
  createMessageObserver,
} from "../core/detection";
import { sendToBackground } from "../core/api/communication";
import { toggleModal } from "./modal";
import { MESSAGE_TYPES } from "../constants";
import { QueryMetric } from "../shared/types";
import { detectModel } from "../core/detection/model";

const checkExtensionContext = (): boolean => {
  try {
    return !!chrome?.runtime?.id;
  } catch (error) {
    return false;
  }
};

// State variables

let isMonitoring: boolean = false;
let messageObserver: MutationObserver | null = null;

// Process detected message
const processDetectedMessage = async (message: QueryMetric) => {
  console.log("AI Wattch: Processing detected message", message);
  // Send data to background script
  try {
    await sendToBackground({ type: MESSAGE_TYPES.AI_METRICS, data: message });
    console.log("AI Wattch: Metrics sent to background", message);
  } catch (error) {
    console.error("AI Wattch: Failed to send metrics:", error);
  }
};

// Start monitoring for a specific platform
const startMonitoring = (platform: string) => {
  if (isMonitoring) {
    console.log("AI Wattch: Already monitoring, stopping previous observer");
    stopMonitoring();
  }

  console.log(`AI Wattch: Starting monitoring for ${platform}`);
  isMonitoring = true;

  // Create message observer using core detection

  if (!platform) {
    console.log("AI Wattch: Unknown Platform detected....");
    return;
  }

  messageObserver = createMessageObserver(
    platform as any,
    processDetectedMessage
  );

  // Start observing
  messageObserver.observe(document.body, {
    childList: true,
    subtree: true,
    // characterData: true,
    // attributes: true,
  });

  console.log("AI Wattch: Message observer started");
};

// Stop monitoring
const stopMonitoring = () => {
  if (messageObserver) {
    messageObserver.disconnect();
    messageObserver = null;
    isMonitoring = false;
    console.log("AI Wattch: Message observer stopped");
  }
};

// Listen for messages from background script
const handleMessage = async (message: any, sender: any, sendResponse: any) => {
  console.log("AI Wattch: Received message:", message);

  if (message.type === MESSAGE_TYPES.TOGGLE_MODAL) {
    console.log("AI Wattch: Toggling modal...");
    await toggleModal();
    sendResponse({ success: true });
  }

  if (message.type === MESSAGE_TYPES.PLATFORM_CHANGED) {
    console.log("AI Wattch: Platform Change detected");
    initializePlatformMonitoring();
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
};

// Initialize the monitor
const initContent = () => {
  console.log("AI Wattch: Initializing content script");

  if (!checkExtensionContext()) {
    console.log("AI Wattch: No extension context found");
    return;
  }

  // Always listen for messages from popup (for modal functionality)
  chrome.runtime.onMessage.addListener(handleMessage);

  // Check if platform is supported for monitoring
  if (!isSupportedPlatform()) {
    console.log("AI Wattch: No supported platform detected for monitoring");
    return;
  }

  initializePlatformMonitoring();
  toggleModal();
};

const initializePlatformMonitoring = () => {
  const platform = detectPlatform();
  detectModel();
  console.log("AI Wattch: Detected platform", platform);

  if (platform) {
    const config = getCurrentPlatformConfig();
    console.log("AI Wattch: Platform config", config);

    startMonitoring(platform);
  }
};

// Cleanup on page unload
const cleanup = () => {
  stopMonitoring();

  // Clear any global state to prevent memory leaks
  if (typeof window !== "undefined") {
    delete (window as any).aiWatchInitialized;
  }
};

if (!window.aiWatchInitialized) {
  window.aiWatchInitialized = true;

  // Start monitoring when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContent);
  } else {
    initContent();
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", cleanup);
}
