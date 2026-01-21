// Optimized session storage utilities with day buckets for blazingly fast access

import { QueryMetric, SessionData, DayBucket } from "../../shared/types";

const STORAGE_KEY = "ai_wattch_session_data";

// Utility functions for date handling
const getDateKey = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-CA"); // YYYY-MM-DD
};

const getTodayKey = (): string => {
  return new Date().toLocaleDateString("en-CA");
};

// Create default day bucket
const createDefaultDayBucket = (date: string): DayBucket => ({
  date,
  sessions: [],
  lastUpdated: Date.now(),
});

// Default session data with day buckets
const createDefaultSessionData = (): SessionData => ({
  dayBuckets: {},
  currentSession: undefined,
  lastUpdated: Date.now(),
});

// Save session data to storage
export const saveSessionData = async (
  sessionData: SessionData
): Promise<void> => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({
        [STORAGE_KEY]: sessionData,
      });
      console.log("AI Wattch: Session data saved", sessionData);
    } else {
      // Fallback to localStorage for development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      console.log("AI Wattch: Session data saved to localStorage", sessionData);
    }
  } catch (error) {
    console.error("AI Wattch: Failed to save session data:", error);
    throw error;
  }
};

// Load session data from storage
export const loadSessionData = async (): Promise<SessionData> => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      const sessionData = result[STORAGE_KEY] || createDefaultSessionData();
      console.log("AI Wattch: Session data loaded", sessionData);
      return sessionData;
    } else {
      // Fallback to localStorage for development
      const stored = localStorage.getItem(STORAGE_KEY);
      const sessionData = stored
        ? JSON.parse(stored)
        : createDefaultSessionData();
      console.log(
        "AI Wattch: Session data loaded from localStorage",
        sessionData
      );
      return sessionData;
    }
  } catch (error) {
    console.error("AI Wattch: Failed to load session data:", error);
    return createDefaultSessionData();
  }
};

// Add QueryMetric to session data - BLAZINGLY FAST
export const addMetricsToSession = async (
  metrics: QueryMetric
): Promise<SessionData> => {
  const sessionData = await loadSessionData();
  const dateKey = getDateKey(metrics.startTime);

  // Get or create day bucket
  if (!sessionData.dayBuckets[dateKey]) {
    sessionData.dayBuckets[dateKey] = createDefaultDayBucket(dateKey);
  }

  const dayBucket = sessionData.dayBuckets[dateKey];

  // Add session to day bucket
  dayBucket.sessions.push(metrics);

  dayBucket.lastUpdated = Date.now();

  sessionData.lastUpdated = Date.now();

  // Update current session if it's today
  const todayKey = getTodayKey();
  if (dateKey === todayKey) {
    if (!sessionData.currentSession) {
      sessionData.currentSession = {};
    }
    sessionData.currentSession[metrics.platform] = metrics;
  }

  // Save updated session data
  await saveSessionData(sessionData);

  return sessionData;
};

// Get today's session data
export const getTodaySessionData = async (): Promise<{
  sessions: QueryMetric[];
  currentSession?: {
    chatgpt?: QueryMetric;
    claude?: QueryMetric;
  } | null;
}> => {
  const sessionData = await loadSessionData();
  const todayKey = getTodayKey();

  const todayBucket = sessionData.dayBuckets[todayKey];

  if (!todayBucket) {
    return {
      sessions: [],
      currentSession: null,
    };
  }

  return {
    sessions: todayBucket.sessions,
    currentSession: sessionData.currentSession,
  };
};

// Get current session data
export const getCurrentSessionData = async (): Promise<
  | {
      chatgpt?: QueryMetric;
      claude?: QueryMetric;
    }
  | undefined
> => {
  const sessionData = await loadSessionData();
  return sessionData.currentSession;
};

// Get session data for a specific date
export const getSessionDataForDate = async (
  date: string
): Promise<DayBucket | undefined> => {
  const sessionData = await loadSessionData();
  return sessionData.dayBuckets[date];
};

// Get session data for date range - OPTIMIZED
export const getSessionDataForDateRange = async (
  startDate: string,
  endDate: string
) => {
  const sessionData = await loadSessionData();
  const result: Record<string, DayBucket> = {};

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];
    if (sessionData.dayBuckets[dateKey]) {
      result[dateKey] = sessionData.dayBuckets[dateKey];
    }
  }

  return result;
};

// Reset session data
export const resetSessionData = async (): Promise<SessionData> => {
  const defaultSessionData = createDefaultSessionData();
  await saveSessionData(defaultSessionData);
  console.log("AI Wattch: Session data reset");
  return defaultSessionData;
};

// Clear old session data (older than specified days) - OPTIMIZED
export const clearOldSessionData = async (
  daysToKeep: number = 3
): Promise<void> => {
  const sessionData = await loadSessionData();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffKey = cutoffDate.toISOString().split("T")[0];

  // Remove old day buckets
  Object.keys(sessionData.dayBuckets).forEach((dateKey) => {
    if (dateKey < cutoffKey) {
      delete sessionData.dayBuckets[dateKey];
    }
  });

  // Update global totals
  sessionData.lastUpdated = Date.now();

  // Clear current session if it's from an old date
  if (sessionData.currentSession) {
    let hasValidSession = false;

    // Check chatgpt session
    if (sessionData.currentSession.chatgpt) {
      const chatgptDateKey = getDateKey(
        sessionData.currentSession.chatgpt.startTime
      );
      if (chatgptDateKey < cutoffKey) {
        delete sessionData.currentSession.chatgpt;
      } else {
        hasValidSession = true;
      }
    }

    // Check claude session
    if (sessionData.currentSession.claude) {
      const claudeDateKey = getDateKey(
        sessionData.currentSession.claude.startTime
      );
      if (claudeDateKey < cutoffKey) {
        delete sessionData.currentSession.claude;
      } else {
        hasValidSession = true;
      }
    }

    // If no valid sessions remain, clear the entire currentSession
    if (!hasValidSession) {
      sessionData.currentSession = undefined;
    }
  }

  if (sessionData.dayBuckets[cutoffKey]) {
    await saveSessionData(sessionData);
    console.log(
      `AI Wattch: Cleared old sessions, removed ${sessionData.dayBuckets[cutoffKey].sessions.length} sessions`
    );
  }
};

// Get all available dates - OPTIMIZED
export const getAvailableDates = async (): Promise<string[]> => {
  const sessionData = await loadSessionData();
  return Object.keys(sessionData.dayBuckets).sort();
};

// Get total tokens for a specific platform - OPTIMIZED
export const getPlatformStats = async (platform: string) => {
  const sessionData = await loadSessionData();
  let totalTokens = 0;
  let totalSessions = 0;
  let totalEnergy = 0;
  let totalEmissions = 0;

  Object.values(sessionData.dayBuckets).forEach((bucket) => {
    bucket.sessions.forEach((session) => {
      if (session.platform.toLowerCase() === platform.toLowerCase()) {
        const sessionTokens = session.inputTokens + session.outputTokens;
        totalTokens += sessionTokens;
        totalSessions += 1;
        totalEnergy += sessionTokens * 0.0001;
        totalEmissions += sessionTokens * 0.0001 * 0.82;
      }
    });
  });

  return {
    platform,
    totalTokens,
    totalSessions,
    totalEnergy,
    totalEmissions,
    averageTokensPerSession:
      totalSessions > 0 ? Math.round(totalTokens / totalSessions) : 0,
  };
};
