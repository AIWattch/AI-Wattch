import { useState, useEffect } from "react";
import { SessionData } from "../types";
import { sendToBackground, addMessageListener } from "../../core/api";
import { MESSAGE_TYPES } from "../../constants";

export const useSessionData = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    dayBuckets: {},
    currentSession: undefined,
    lastUpdated: Date.now(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial session data
    const loadSessionData = async () => {
      try {
        const response = await sendToBackground({
          type: MESSAGE_TYPES.GET_SESSION_DATA,
        });
        if (response) {
          setSessionData(response);
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
    const handleMessage = (message: any) => {
      if (message.type === MESSAGE_TYPES.SESSION_UPDATED) {
        setSessionData(message.data);
        console.log("AI Wattch: Session updated in hook", message.data);
      }
    };

    addMessageListener(handleMessage);

    return () => {
      // Note: We don't remove the listener here as it's managed by the core API
    };
  }, []);

  const resetSession = async () => {
    try {
      const response = await sendToBackground({
        type: MESSAGE_TYPES.RESET_SESSION,
      });
      if (response?.success) {
        setSessionData({
          dayBuckets: {},
          currentSession: undefined,
          lastUpdated: Date.now(),
        });

        console.log("AI Wattch: Session reset successfully in hook");
      }
    } catch (error) {
      console.error("AI Wattch: Failed to reset session:", error);
    }
  };

  return {
    sessionData,
    loading,
    resetSession,
  };
};
