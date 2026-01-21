// Communication utilities between content script, background, and popup

import { ExtensionMessage } from "../../shared/types";

// Send message to background script
export const sendToBackground = async <T = any>({
  type,
  data,
  timeoutMs = 10000,
}: {
  type: string;
  data?: any;
  timeoutMs?: number;
}): Promise<T> => {
  try {
    // Check if Chrome runtime API is available
    if (!chrome?.runtime?.sendMessage) {
      throw new Error("Chrome runtime API not available");
    }

    // Use AbortController for better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Modern promise-based approach
      const response = await chrome.runtime.sendMessage({ type, data });
      clearTimeout(timeoutId);

      console.log("AI Watch: Received message from background", response);
      return response as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (controller.signal.aborted) {
        throw new Error(
          `Timeout: No response from background script after ${timeoutMs}ms`
        );
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send message to background script"
      );
    }
  } catch (error) {
    console.error("AI Watch: Error sending message to background:", error);
    throw error;
  }
};

// Sends a message to the content script in the specified or active tab
export const sendToContentScript = async <T = any>({
  tabId,
  type,
  data,
  timeoutMs = 10000,
}: {
  tabId?: number;
  type: string;
  data?: any;
  timeoutMs?: number;
}): Promise<T> => {
  try {
    // Get tab ID if not provided
    let finalTabId = tabId;
    if (!finalTabId) {
      const activeTab = await getActiveTab();
      console.log("AI Watch: Active tab", activeTab);
      finalTabId = activeTab?.id;
    }

    if (!finalTabId) {
      throw new Error("No tab ID provided and no active tab found");
    }

    // Check if Chrome tabs API is available
    if (!chrome?.tabs?.sendMessage) {
      throw new Error("Chrome tabs API not available");
    }

    // Use AbortController for better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Modern promise-based approach
      const response = await chrome.tabs.sendMessage(finalTabId, {
        type,
        data,
      });
      clearTimeout(timeoutId);

      return response as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (controller.signal.aborted) {
        throw new Error(
          `Timeout: No response from content script after ${timeoutMs}ms`
        );
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send message to content script"
      );
    }
  } catch (error) {
    console.error("AI Watch: Error sending message to content script:", error);
    throw error;
  }
};

// Listen for messages
export const addMessageListener = (
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => boolean | void
): (() => void) => {
  if (!chrome?.runtime?.onMessage) {
    console.warn("AI Watch: Chrome runtime API not available");
    return () => {};
  }

  console.log("AI Watch: Adding message listener");

  const messageHandler = (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): boolean => {
    try {
      return callback(message, sender, sendResponse) || false;
    } catch (error) {
      console.error("AI Watch: Message handler error:", error);
      sendResponse({
        error: error instanceof Error ? error.message : "Handler failed",
      });
      return false;
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);

  return () => chrome.runtime.onMessage.removeListener(messageHandler);
};

// Remove message listener
export const removeMessageListener = (
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ) => void
): void => {
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.removeListener(callback);
  }
};

export const notifyAllTabs = async (
  type: string,
  data?: any,
  options: {
    onlyActiveWindows?: boolean;
    excludeIncognito?: boolean;
    skipErrors?: boolean;
  } = {}
): Promise<void> => {
  if (!chrome?.tabs?.query) {
    console.warn("AI Watch: Chrome tabs API not available");
    return;
  }

  try {
    // Build query with optional filters
    const queryOptions: chrome.tabs.QueryInfo = {};
    if (options.onlyActiveWindows) {
      queryOptions.currentWindow = true;
    }

    const tabs = await chrome.tabs.query(queryOptions);

    // Filter tabs if needed
    const filteredTabs = tabs.filter((tab) => {
      if (!tab.id) return false;
      if (options.excludeIncognito && tab.incognito) return false;
      return true;
    });

    console.log(
      `AI Watch: Notifying ${filteredTabs.length} tabs with message type: ${type}`
    );

    const promises = filteredTabs.map(async (tab) => {
      try {
        await sendToContentScript({ tabId: tab.id!, type, data });
      } catch (error) {
        if (!options.skipErrors) {
          console.warn(`AI Watch: Failed to notify tab ${tab.id}:`, error);
        }
        // Continue with other tabs even if one fails
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("AI Watch: Failed to query tabs:", error);
    throw error;
  }
};

// Get current active tab
export const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
  if (typeof chrome !== "undefined" && chrome.tabs?.query) {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      return tabs[0] || null;
    } catch (error) {
      console.error("AI Wattch: Failed to get active tab:", error);
      return null;
    }
  }
  return null;
};
