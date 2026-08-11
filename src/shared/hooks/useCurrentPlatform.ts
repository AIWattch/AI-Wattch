import { useState, useEffect } from "react";
import {
  detectPlatform,
  getPlatformDisplayName,
  SupportedPlatform,
} from "../../core/detection/platform";
import { detectModel } from "../../core/detection/model";

import { useStorageObserver } from "./useStorageObserver";
import { SETTINGS_KEY } from "../../core";
import { ModelInfo, PlatformDetails } from "../types";

export const useCurrentPlatform = (): PlatformDetails => {
  const [currentPlatform, setCurrentPlatform] =
    useState<SupportedPlatform | null>(null);
  const [platformName, setPlatformName] = useState<string>("");
  const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedModel = useStorageObserver(SETTINGS_KEY);

  // Platform detection effect
  useEffect(() => {
    const handlePlatformData = () => {
      const platform = detectPlatform();
      setCurrentPlatform(platform);
      setPlatformName(platform ? getPlatformDisplayName(platform) : "");
      setCurrentModel(null);
      setIsLoading(false);
    };

    handlePlatformData();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handlePlatformData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Model detection effect (runs only when platform or selected model changes)
  useEffect(() => {
    const handleModelData = (force: boolean) => {
      if (!currentPlatform) return;

      const selectedModelForPlatform =
        selectedModel?.selectedModel?.platform === currentPlatform
          ? selectedModel.selectedModel
          : null;

      // Only detect if model is null or platform has changed.
      // If the stored selection belongs to a different platform, ignore it.
      const shouldDetectModel = currentModel === null || force;

      if (shouldDetectModel) {
        const detectedModel = detectModel();

        if (detectedModel && detectedModel.platform === currentPlatform) {
          setCurrentModel(detectedModel);
          return;
        }

        if (selectedModelForPlatform) {
          setCurrentModel(selectedModelForPlatform);
          return;
        }

        setCurrentModel(null);
        return;
      }

      if (selectedModelForPlatform) {
        setCurrentModel(selectedModelForPlatform);
      }
    };

    handleModelData(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleModelData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    currentPlatform,
    selectedModel?.selectedModel?.modelName,
    selectedModel?.selectedModel?.platform,
  ]);

  return {
    currentPlatform,
    platformName,
    currentModel,
    isLoading,
  };
};
