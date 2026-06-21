// Settings storage utilities

import { UserSettings } from "../../shared/types";
import {
  fetchUserLocation,
  GLOBAL_LOCATION,
} from "../../shared/utils/locationService";
import { browser } from "../../lib/browserApi";

export const SETTINGS_KEY = "ai_wattch_settings";

// Default settings
const createDefaultSettings = (): UserSettings => ({
  calculationMethod: "token",
  selectedModel: null,
  location: GLOBAL_LOCATION,
  hasSeenWelcome: false,
  allowedToTrack: false,
});

// Save user settings
export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await browser.storage.local.set({ [SETTINGS_KEY]: settings });
    console.log("AI Wattch: Settings saved", settings);
  } catch {
    // Fallback to localStorage for development
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log("AI Wattch: Settings saved to localStorage", settings);
  }
};

// Load user settings
export const loadSettings = async (): Promise<UserSettings> => {
  try {
    const result = await browser.storage.local.get([SETTINGS_KEY]);
    const settings = result[SETTINGS_KEY] || createDefaultSettings();
    console.log("AI Wattch: Settings loaded", settings);
    return settings;
  } catch {
    // Fallback to localStorage for development
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : createDefaultSettings();
    console.log("AI Wattch: Settings loaded from localStorage", settings);
    return settings;
  }
};

export const updateSetting = async (
  updates: Partial<UserSettings>
): Promise<UserSettings> => {
  const settings = await loadSettings();
  const newSettings = { ...settings, ...updates };
  await saveSettings(newSettings);

  return newSettings;
};

// Reset settings to default
export const resetSettings = async (): Promise<UserSettings> => {
  const defaultSettings = createDefaultSettings();
  const useLocation = await fetchUserLocation();
  await saveSettings({
    ...defaultSettings,
    hasSeenWelcome: true,
    location: { ...useLocation, autoDetected: true },
  });
  console.log("AI Wattch: Settings reset to default");
  return defaultSettings;
};

// Mark welcome as seen
export const markWelcomeAsSeen = async (): Promise<void> => {
  await updateSetting({ hasSeenWelcome: true });
  console.log("AI Wattch: Welcome marked as seen");
};

// Allow Tracking
export const allowEmissionTracking = async (): Promise<void> => {
  await updateSetting({ allowedToTrack: true });
  console.log("AI Wattch: Allowed To track");
};

export const updateSelectedModel = async (
  value: UserSettings["selectedModel"]
): Promise<void> => {
  console.log("AI Wattch: Updating selected model", value);
  const settings = await loadSettings();
  settings.selectedModel = value;
  await saveSettings(settings);
};
