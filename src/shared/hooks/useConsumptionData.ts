import { useState, useEffect, useCallback, useRef } from "react";
import { ConsumptionByPlatform } from "../types";
import { sendToBackground, addMessageListener } from "../../core/api";
import { MESSAGE_TYPES } from "../../constants";
import { defaultConsumptionByPlatform } from "../../shared/utils/defaults";
import { useStorageObserver } from "./useStorageObserver";
import { useCurrentPlatform } from "./useCurrentPlatform";
import { useSettings } from "./useSettings";

export const useConsumptionData = () => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionByPlatform>(
    defaultConsumptionByPlatform
  );

  const [loading, setLoading] = useState(true);
  const listenerRef = useRef<(() => void) | null>(null);

  const { currentModel } = useCurrentPlatform();
  const { settings } = useSettings();
  console.log(settings, "settings?.location?.countryName");

  // Memoize message handler to prevent unnecessary re-renders
  const handleMessage = useCallback(
    (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse?: (response?: any) => void
    ) => {
      console.log("AI Wattch: Message received in hook", message);
      if (message.type === MESSAGE_TYPES.CONSUMPTION_UPDATED) {
        setConsumptionData((prevData) => {
          // Only update if data actually changed to prevent unnecessary re-renders
          if (JSON.stringify(prevData) === JSON.stringify(message.data)) {
            return prevData;
          }
          console.log("AI Wattch: Session updated in hook", message.data);
          return message.data;
        });
        sendResponse?.({ success: true });
      }
    },
    []
  );

  useEffect(() => {
    // Load initial session data
    const loadSessionData = async () => {
      console.log(
        settings?.location?.countryName,
        "settings?.location?.countryName"
      );
      try {
        const response = await sendToBackground({
          type: MESSAGE_TYPES.GET_CONSUMPTION_DATA,
        });

        if (response) {
          setConsumptionData(response);
          console.log("AI Wattch: Session data loaded in hook", response);
        }
        setLoading(false);
      } catch (error) {
        console.error("AI Wattch: Failed to load session data:", error);
        setLoading(false);
      }
    };

    loadSessionData();

    // Listen for session updates
    listenerRef.current = addMessageListener(handleMessage);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSessionData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      // Properly clean up the listener
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [handleMessage, currentModel?.modelName, settings?.location?.countryName]);

  const resetSession = async () => {
    try {
      const response = await sendToBackground({
        type: MESSAGE_TYPES.RESET_SESSION,
      });
      if (response?.success) {
        setConsumptionData(defaultConsumptionByPlatform);

        console.log("AI Wattch: Session reset successfully in hook");
      }
    } catch (error) {
      console.error("AI Wattch: Failed to reset session:", error);
    }
  };

  return {
    consumptionData,
    loading,
    resetSession,
  };
};
