import { useStorageObserver } from "./useStorageObserver";
import { SETTINGS_KEY } from "../../core";
import { UserSettings } from "../types";

export const useSettings = (): { settings: UserSettings | undefined } => {
  const settingsObserver = useStorageObserver<UserSettings>(SETTINGS_KEY);

  return {
    settings: settingsObserver,
  };
};
