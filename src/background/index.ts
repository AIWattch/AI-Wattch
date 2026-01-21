// Background script for AI Wattch extension

import { ConsumptionByPlatform, QueryMetric } from "../shared/types";
import {
  loadSessionData,
  addMetricsToSession,
  resetSessionData,
  getTodaySessionData,
  loadSettings,
  updateSetting,
} from "../core/storage";
import {
  addMessageListener,
  sendToContentScript,
  calculateConsumptionApi,
} from "../core/api";
import { MESSAGE_TYPES } from "../constants";
import { fetchUserLocationInternal } from "../shared/utils/locationService";
import { defaultConsumptionByPlatform } from "../shared/utils/defaults";

console.log("Service worker started");

let isInitialized = false;

// Process AI metrics with better error handling
const processAIMetrics = async (
  metrics?: QueryMetric | null,
): Promise<ConsumptionByPlatform> => {
  console.log("AI Watch: Processing metrics", metrics);
  const settings = await loadSettings();
  const platform = settings?.selectedModel?.platform;

  let currentSessionTemp = null;
  try {
    if (metrics) {
      // Add metadata from settings if not already present
      if (!metrics.modelId) {
        metrics.modelId = settings.selectedModel?.modelId || undefined;
      }
      if (!metrics.calculationMethod) {
        metrics.calculationMethod = settings.calculationMethod;
      }

      const consumption = await calculateConsumptionApi(metrics, settings);
      if (consumption) {
        await addMetricsToSession({ ...metrics, ...consumption });
      }
    } else {
      const sessionData = await getTodaySessionData();
      const currentSession = platform
        ? sessionData.currentSession?.[platform]
        : null;
      if (currentSession) {
        const consumption = await calculateConsumptionApi(
          currentSession,
          settings,
        );
        if (consumption) {
          currentSessionTemp = consumption;
        }
      }
    }

    const sessionData = await getTodaySessionData();

    const totalConsumption = toConsumptionByPlatform(sessionData);

    if (currentSessionTemp && platform) {
      totalConsumption.currentConsumption[platform].carbonEmissionsKgCO2e =
        currentSessionTemp.carbonEmissionsKgCO2e;
      totalConsumption.currentConsumption[platform].energyKWh =
        currentSessionTemp.energyKWh;
      totalConsumption.currentConsumption[platform].metrics = {
        waterConsumption: currentSessionTemp.waterConsumption,
        lightBulbMinutes: currentSessionTemp.lightBulbMinutes,
        smartphoneCharges: currentSessionTemp.smartphoneCharges,
      };
    }

    console.log("AI Watch: Calculated consumption", sessionData);
    await notifyPopup(totalConsumption);

    return totalConsumption;
  } catch (error) {
    console.error("AI Watch: Error processing metrics:", error);
    return defaultConsumptionByPlatform;
  }
};

function toConsumptionByPlatform(data: {
  sessions: QueryMetric[];
  currentSession?: {
    chatgpt?: QueryMetric;
    claude?: QueryMetric;
  } | null;
}): ConsumptionByPlatform {
  const sum = <T extends number | undefined>(
    items: QueryMetric[],
    selector: (m: QueryMetric) => T,
  ) => items.reduce((acc, m) => acc + (selector(m) ?? 0), 0);

  const createConsumption = (sessions: QueryMetric[]) => ({
    energyKWh: sum(sessions, (m) => m.energyKWh),
    carbonEmissionsKgCO2e: sum(sessions, (m) => m.carbonEmissionsKgCO2e),
    metrics: {
      waterConsumption: Math.round(sum(sessions, (m) => m.waterConsumption)),
      lightBulbMinutes: Math.round(sum(sessions, (m) => m.lightBulbMinutes)),
      smartphoneCharges: Math.round(sum(sessions, (m) => m.smartphoneCharges)),
    },
  });

  const createCurrentConsumption = (metric?: QueryMetric) => ({
    energyKWh: metric?.energyKWh ?? 0,
    carbonEmissionsKgCO2e: metric?.carbonEmissionsKgCO2e ?? 0,
    metrics: {
      waterConsumption: Math.round(metric?.waterConsumption ?? 0),
      lightBulbMinutes: Math.round(metric?.lightBulbMinutes ?? 0),
      smartphoneCharges: Math.round(metric?.smartphoneCharges ?? 0),
    },
  });

  const sessionsByPlatform = (platform: string) =>
    data.sessions.filter((m) => m.platform === platform);

  return {
    chatgptConsumption: createConsumption(sessionsByPlatform("chatgpt")),
    claudeConsumption: createConsumption(sessionsByPlatform("claude")),
    currentConsumption: {
      chatgpt: createCurrentConsumption(data.currentSession?.chatgpt),
      claude: createCurrentConsumption(data.currentSession?.claude),
    },
  };
}

// Notify popup with better error handling
const notifyPopup = async (
  sessionData: ConsumptionByPlatform,
): Promise<void> => {
  try {
    console.log("AI Watch: Notifying popup of consumption update", sessionData);

    await sendToContentScript({
      type: MESSAGE_TYPES.CONSUMPTION_UPDATED,
      data: sessionData,
    });

    console.log("AI Watch: Successfully notified popup");
  } catch (error) {
    // Popup might not be open - this is expected behavior
    console.log("AI Watch: Popup not available for notification");
  }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    await sendToContentScript({
      tabId: tabId,
      type: MESSAGE_TYPES.PLATFORM_CHANGED,
      data: { url: tab.url },
    });
  }
});

const submitFeedback = async (formData: {
  name: string;
  email: string;
  feedback: string;
}) => {
  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "WaIUcSCCsww3-LUTo",
          service_id: "service_a8uwk2j",
          template_id: "template_ev3cieb",
          template_params: {
            name: formData.name,
            email: formData.email,
            message: formData.feedback,
          },
        }),
      },
    );

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      throw new Error(`EmailJS failed: ${errorText}`);
    }
  } catch (error) {
    console.error("AI Watch: Feedback submission failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const handleMessage = async (
  message: { type: string; data?: any },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): Promise<boolean> => {
  console.log("AI Watch: Received message", message.type, sender);

  try {
    switch (message.type) {
      case MESSAGE_TYPES.AI_METRICS:
        await processAIMetrics(message.data);
        sendResponse({ success: true });
        return true;

      case MESSAGE_TYPES.GET_SESSION_DATA:
        const sessionData = await getTodaySessionData();
        sendResponse(sessionData);
        return true;

      case MESSAGE_TYPES.GET_CONSUMPTION_DATA:
        const consumptionData = await processAIMetrics();
        sendResponse(consumptionData);
        return true;

      case MESSAGE_TYPES.RESET_SESSION:
        const resetData = await resetSessionData();
        sendResponse({ success: true, data: resetData });
        return true;

      case MESSAGE_TYPES.GET_SETTINGS:
        const settings = await loadSettings();
        sendResponse(settings);
        return true;

      case MESSAGE_TYPES.SUBMIT_FEEDBACK:
        const feedbackResponse = await submitFeedback(message.data);
        sendResponse(feedbackResponse);
        return true;

      case MESSAGE_TYPES.FETCH_LOCATION:
        const userLocation = await fetchUserLocationInternal();
        sendResponse(userLocation);
        return true;

      default:
        console.warn("AI Watch: Unknown message type:", message.type);
        sendResponse({ error: "Unknown message type" });
        return false;
    }
  } catch (error) {
    console.error("AI Watch: Error handling message:", error);
    sendResponse({
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
};

// const waitForDocumentReady = async (tabId: number): Promise<void> => {
//   await new Promise<void>((resolve) => {
//     const check = async () => {
//       const [{ result: readyState }] = await chrome.scripting.executeScript({
//         target: { tabId },
//         func: () => document.readyState,
//       });

//       console.log("document.readyState", readyState);

//       if (readyState === "complete") {
//         resolve();
//       } else {
//         setTimeout(check, 200);
//       }
//     };
//     check();
//   });
// };

// Handle icon clicks
let openPopupRetry = 0;

const handleIconClick = async (tab: chrome.tabs.Tab): Promise<void> => {
  if (openPopupRetry >= 10) {
    openPopupRetry = 0;
    return;
  }
  if (!tab.id) {
    console.warn("AI Watch: No tab ID available");
    return;
  }

  console.log("AI Watch: Extension icon clicked");
  // await waitForDocumentReady(tab.id);
  // console.log("AI Watch: Document is ready (complete)");

  console.log("AI Watch: Sending toggle modal message");

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.TOGGLE_MODAL,
    });
    // ⏳ Wait for document to be fully loaded

    console.log("AI Watch: Toggle modal message sent");
    openPopupRetry = 0;
  } catch (error) {
    const currentTab = await chrome.tabs.get(tab.id);
    const isChatSite =
      currentTab.url?.includes("chatgpt") ||
      currentTab.url?.includes("claude.ai");

    if (isChatSite) {
      openPopupRetry += 1;
      await new Promise((r) => setTimeout(r, 500)); // small delay
      await handleIconClick(tab);
    } else {
      // injectNoAccessScript(tab.id);

      console.error("AI Watch: Failed to send toggle message:", error);
    }
  }
};

// Initialize the background service
const initBackground = async (): Promise<void> => {
  if (isInitialized) {
    console.log("AI Watch: Background service already initialized");
    return;
  }

  console.log("AI Watch: Initializing background service");

  try {
    // Set up message listener
    addMessageListener((message, sender, sendResponse) => {
      handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async responses
    });

    // Auto-detect location if not set
    const settings = await loadSettings();
    if (
      settings &&
      settings.location &&
      settings.location.countryCode === "world"
    ) {
      const detected = await fetchUserLocationInternal();
      await updateSetting({
        location: { ...detected, autoDetected: true },
      });
    }
    // Initialize storage
    await loadSessionData();

    isInitialized = true;
    console.log("AI Watch: Background service initialized successfully");
  } catch (error) {
    console.error("AI Watch: Failed to initialize background service:", error);
    throw error;
  }
};

// Start the background service
initBackground().catch((error) => {
  console.error("AI Watch: Critical initialization error:", error);
});

// Inject minimal script for unsupported sites (runs in tab context)
const injectNoAccessScript = async (tabId: number): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // This function runs in the tab's context where document is available
        const showMessage = () => {
          // Remove any existing notifications
          const existing = document.querySelector("#ai-watch-notification");
          if (existing) {
            existing.remove();
          }

          // Create and show notification
          const notification = document.createElement("div");
          notification.id = "ai-watch-notification";
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 16px;
            border-radius: 8px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 300px;
            font-size: 14px;
          `;
          notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>⚠️</span>
              <div>
                <strong>AI Wattch</strong><br>
                <span style="font-size: 12px;">This extension only works on supported AI platforms like ChatGPT and Claude.</span>
              </div>
            </div>
          `;

          document.body.appendChild(notification);

          // Auto-remove after 4 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 4000);
        };

        // Call the function
        showMessage();
      },
    });
  } catch (error) {
    console.error("AI Watch: Failed to inject no-access script:", error);

    try {
      chrome.action.setPopup({
        tabId: tabId,
        popup: chrome.runtime.getURL("src/content/noAccess.html"),
      });
      chrome.action.openPopup(); // behaves like normal extension popup
    } catch (e) {
      console.error("AI Watch: Failed to open notification window:", e);
    }
  }
};

const ALLOWED_DOMAINS = [
  "https://chat.openai.com/*",
  "https://chatgpt.com/*",
  "https://claude.ai/*",
] as const;

const reloadAllowedTabs = async (): Promise<void> => {
  try {
    console.log("AI Watch: Finding tabs to reload...");

    // Query tabs matching allowed domains
    const tabs = await chrome.tabs.query({
      url: ALLOWED_DOMAINS as any,
    });

    // const tabs = await chrome.tabs.query({});
    if (tabs.length === 0) {
      console.log("AI Watch: No tabs found on supported platforms");
      return;
    }

    console.log(
      `AI Watch: Found ${tabs.length} tabs to reload on supported platforms`,
    );

    // Reload all matching tabs
    const reloadPromises = tabs.map(async (tab) => {
      if (tab.id) {
        try {
          await chrome.tabs.reload(tab.id);
          console.log(`AI Watch: Reloaded tab: ${tab.url}`);
        } catch (error) {
          console.warn(`AI Watch: Failed to reload tab ${tab.id}:`, error);
        }
      }
    });

    await Promise.allSettled(reloadPromises);
    console.log("AI Watch: Tab reload process completed");
  } catch (error) {
    console.error("AI Watch: Error during tab reload:", error);
  }
};

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`AI Watch: Extension ${details.reason}`);

  if (details.reason === "install" || details.reason === "update") {
    console.log("AI Watch: Reloading tabs on supported platforms...");
    reloadAllowedTabs();
  }
});
