import React, { useState, useMemo, useEffect } from "react";

import { getAllModelsByPlatform, LLM_MODELS } from "../../constants";
import { getLocations } from "../../shared/utils/locationService";
import {
  ClaudeLogo,
  CloseIcon,
  GPTLogo,
  InfoIcon,
  ExternalLinkIcon,
} from "../../icons";
import { Location, ModelInfo, UserSettings } from "../../shared/types";
import Tooltip from "../../shared/components/Tooltip";
import { CustomSelect } from "../../shared/components";
import { useStorageObserver } from "../../shared/hooks/useStorageObserver";
import {
  detectPlatform,
  resetSettings,
  SETTINGS_KEY,
  updateSetting,
} from "../../core";
import { detectModel } from "../../core/detection/model";
import FlagIcon from "../../icons/FlagIcon";

// Custom Select Component

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { locations, quickLocations } = useMemo(() => getLocations(), []);

  const [settingChanged, setSettingChanged] = useState(false);

  const settings = useStorageObserver<UserSettings>(SETTINGS_KEY);

  const [localSettings, setLocalSettings] = useState<UserSettings>({
    calculationMethod: "token",
    selectedModel: LLM_MODELS[0],
    location: locations[2],
  });

  const updateLocalSettings = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newLocalSettings = {
      ...localSettings,
      [key]: value,
    };
    setLocalSettings(newLocalSettings);

    const isChanged =
      newLocalSettings.calculationMethod !== settings?.calculationMethod ||
      newLocalSettings.location?.countryName !==
        settings?.location?.countryName ||
      newLocalSettings.selectedModel?.modelName !==
        settings.selectedModel?.modelName;

    setSettingChanged(isChanged);
  };

  useEffect(() => {
    console.log("Settings updated:", settings);
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const saveSettings = async () => {
    await updateSetting({
      calculationMethod: localSettings.calculationMethod,
      location: localSettings.location,
      selectedModel: localSettings.selectedModel,
    });
    setSettingChanged(false);
    onClose();
  };

  const resetSettingsLocal = async () => {
    await resetSettings();
    detectModel();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center adjvnds"
      style={{
        zIndex: 2147483649,
      }}
      onClick={onClose}
    >
      <div
        style={{
          boxShadow: "0px 2px 10px 0px #00000033",
          pointerEvents: "auto",
        }}
        className="bg-white rounded-2xl border border-glacier-500 w-[350px] p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-obsidian">Configure</h2>
            <Tooltip
              title={
                <p className="max-w-[231px]">
                  Choose how your impact is calculated. The method, AI model,
                  and location all influence energy use, emissions, and water
                  consumption giving you results tailored to your context.
                </p>
              }
            >
              <InfoIcon size={16} className=" text-grey-500" />
            </Tooltip>
          </div>
          <button
            onClick={onClose}
            className=" hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="w-full h-[1px] bg-grey-200 rounded" />

        <div className="bg-mist rounded-lg p-3">
          {/* Calculation Method */}
          <div className="">
            <p className="text-xs mb-2 leading-13 font-regular text-obsidian">
              Calculation method
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateLocalSettings("calculationMethod", "token")
                }
                className={`flex-1 h-8 px-3 rounded-full text-obsidian border-[0.5px]  text-sm font-regular transition-colors flex items-center justify-center gap-2 ${
                  localSettings.calculationMethod === "token"
                    ? "bg-glacier-500"
                    : "bg-white hover:border-glacier-500 "
                }`}
              >
                Token
                <Tooltip
                  title={
                    <p className="max-w-[231px]">
                      Best suited for lightweight queries and quick
                      calculations. Token-based methods estimate energy by
                      linking the number of tokens to your model’s compute
                      requirements.
                    </p>
                  }
                >
                  <InfoIcon size={16} />
                </Tooltip>
              </button>
              <button
                onClick={() => updateLocalSettings("calculationMethod", "time")}
                className={`flex-1 h-8 px-3 text-obsidian rounded-full border-[0.5px]  text-sm font-regular transition-colors flex items-center justify-center gap-2 ${
                  localSettings.calculationMethod === "time"
                    ? "bg-glacier-500 "
                    : "bg-white hover:border-glacier-500 "
                }`}
              >
                Time (Beta)
                <Tooltip
                  title={
                    <p className="max-w-[231px]">
                      Best for complex tasks (e.g., summarizing long documents,
                      multi-step reasoning, or large outputs). Time-based
                      methods estimate energy from the actual duration of GPU
                      activity, factoring in GPU power draw, utilization rates,
                      etc.
                    </p>
                  }
                >
                  <InfoIcon size={16} />
                </Tooltip>
              </button>
            </div>
          </div>

          {/* Type of Model */}
          <div className="space-y-2 mt-4">
            <p className="text-xs leading-13 font-regular text-obsidian">
              Type of model
            </p>
            <CustomSelect
              value={localSettings.selectedModel}
              onSelect={(value: ModelInfo) => {
                console.log("Selected model:", value);
                updateLocalSettings("selectedModel", {
                  ...value,
                  autoDetected: false,
                });
              }}
              options={getAllModelsByPlatform(detectPlatform() || "chatgpt")}
              searchPlaceholder="Search Model"
              renderSelected={(model: ModelInfo) => (
                <>
                  {model.platform === "claude" ? (
                    <ClaudeLogo size={13} />
                  ) : (
                    <GPTLogo fill="#000000" size={13} />
                  )}
                  <span>
                    {model.modelName}{" "}
                    {model.autoDetected ? " [Auto-detected]" : null}
                  </span>
                </>
              )}
              renderOption={(model: ModelInfo) => (
                <div
                  className={`w-full p-2 flex rounded-lg items-center gap-3 font-medium text-left text-sm  transition-colors ${
                    localSettings?.selectedModel?.modelName === model.modelName
                      ? "bg-glacier-200 text-obsidian"
                      : "hover:bg-grey-100 text-grey-600"
                  }`}
                >
                  {model.platform === "claude" ? (
                    <ClaudeLogo size={13} />
                  ) : (
                    <GPTLogo fill="#000000" size={13} />
                  )}

                  <span>
                    {model.modelName}{" "}
                    {model.autoDetected ? " [Auto-detected]" : null}
                  </span>
                </div>
              )}
            />
          </div>

          {/* Location */}
          <div className="space-y-2 mt-4">
            <p className="text-xs  leading-13 font-regular text-obsidian">
              Location
            </p>
            <CustomSelect
              value={localSettings.location}
              onSelect={(value: Location) =>
                updateLocalSettings("location", {
                  ...value,
                  autoDetected: false,
                })
              }
              quickOptions={quickLocations}
              options={locations}
              searchPlaceholder="Search Country"
              renderSelected={(location: Location) => (
                <>
                  <FlagIcon
                    key={location.countryCode}
                    flagIcon={location.flagIcon || "https://flagcdn.com/in.svg"}
                    countryCode={location.countryCode || "IN"}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>
                    {location.countryName}{" "}
                    {location.autoDetected ? " [Auto-detected]" : null}
                  </span>
                </>
              )}
              renderOption={(location: Location) => (
                <div
                  className={`w-full p-2 flex rounded-lg items-center gap-3  text-left text-sm  transition-colors ${
                    localSettings?.location?.countryName ===
                    location.countryName
                      ? "bg-glacier-200 text-obsidian"
                      : "hover:bg-grey-100 text-grey-600"
                  }`}
                >
                  <FlagIcon
                    flagIcon={location.flagIcon || "https://flagcdn.com/in.svg"}
                    countryCode={location.countryCode || "IN"}
                    className="w-4 h-4 rounded-full object-cover"
                  />

                  <span>
                    {location.countryName}{" "}
                    {location.autoDetected ? " [Auto-detected]" : null}
                  </span>
                </div>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 ">
          <div className="flex gap-2">
            <button
              onClick={resetSettingsLocal}
              className="w-[85px] h-8  border border-midnight-ocean-500 rounded-full text-sm  text-midnight-ocean-500 hover:bg-grey-100 transition-colors"
            >
              Reset
            </button>

            <button
              disabled={!settingChanged}
              onClick={saveSettings}
              className={`flex-1 h-8  border  rounded-full text-sm 
                 ${
                   !settingChanged
                     ? "cursor-not-allowed bg-grey-100  text-grey-300 border-grey-200"
                     : "hover:bg-glacier-500 bg-glacier-400 border-midnight-ocean-400 text-midnight-ocean-500"
                 }`}
            >
              Update Settings
            </button>
          </div>

          <button
            onClick={() => {
              // window.open(
              //   "https://antarctica.io/research/one-token-model",
              //   "_blank"
              // );

              window.open("https://antarctica.io/ai-wattch", "_blank");
            }}
            className="flex w-full items-center justify-center gap-1.5 h-8  bg-mist rounded-full text-sm  text-midnight-ocean-500 hover:bg-grey-100 transition-colors"
          >
            View Methodology
            <ExternalLinkIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
