import React from "react";

import { GPTLogo } from "../../../icons/GPTLogo";
import { ClaudeLogo } from "../../../icons/ClaudeLogo";

import { InfoIcon } from "../../../icons/InfoIcon";

import {
  formatEmissions,
  formatEnergy,
} from "../../../shared/utils/formatting";
import { ConsumptionByPlatform, PlatformDetails } from "../../../shared/types";
import { ChevronDown } from "lucide-react";
import { useSettings } from "../../../shared/hooks/useSettings";
import Tooltip from "../../../shared/components/Tooltip";
import FlagIcon from "../../../icons/FlagIcon";

export const MetricsCard: React.FC<{
  consumptionData: ConsumptionByPlatform;
  platformDetails: PlatformDetails;
  setShowSettings: (value: boolean) => void;
}> = ({ consumptionData, platformDetails, setShowSettings }) => {
  const {
    currentPlatform,
    platformName,
    currentModel,
    isLoading: platformLoading,
  } = platformDetails;

  const consumption =
    currentModel?.platform === "chatgpt"
      ? consumptionData.currentConsumption.chatgpt
      : consumptionData.currentConsumption.claude;

  // console.log("MetricsCard consumption:", consumptionData);
  const { settings } = useSettings();

  const energy = formatEnergy(consumption.energyKWh || 0);
  const emissions = formatEmissions(consumption.carbonEmissionsKgCO2e || 0);
  return (
    <div className=" pt-2.5 px-2.5 flex flex-col gap-2 ">
      {/* Model Selection */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2"
        >
          {platformLoading ? (
            <div className="w-5 h-5 bg-grey-200 rounded animate-pulse"></div>
          ) : currentPlatform === "chatgpt" ? (
            <GPTLogo size={13} />
          ) : currentPlatform === "claude" ? (
            <ClaudeLogo size={13} />
          ) : (
            <div className="w-5 h-5 bg-grey-300 rounded"></div>
          )}
          <span className="text-xs font-medium text-white">
            {platformLoading
              ? "..."
              : currentModel?.modelName || platformName || "Unknown Model"}
          </span>
          <ChevronDown size={8} />
        </button>

        <Tooltip
          position="bottom-left"
          title={settings?.location?.countryName || "Worldwide Default"}
        >
          <button onClick={() => setShowSettings(true)}>
            <FlagIcon
              flagIcon={
                settings?.location?.flagIcon || "https://flagcdn.com/in.svg"
              }
              countryCode={settings?.location?.countryCode || "IN"}
            />
            {/* <img
              src={settings?.location?.flagIcon || "https://flagcdn.com/in.svg"}
              alt={settings?.location?.countryCode || "IN"}
              crossOrigin=""
              content=""
              
              className="w-[15px] h-[15px] rounded-full object-cover"
            /> */}
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center justify-center gap-1 text-glacier-500">
        <span className="text-sm leading-150 font-normal ">
          Your current prompt
        </span>
        <Tooltip
          position="bottom-left"
          title={
            <>
              The environmental impact <br></br> of the prompt you just wrote.
            </>
          }
        >
          <InfoIcon size={12} />
        </Tooltip>
      </div>

      {/* Current Prompt Metrics */}
      <div>
        <div className="flex items-center ">
          <div className="flex flex-1 flex-col items-center">
            <div className="text-xs leading-150 font-medium text-white mb-1">
              ENERGY
            </div>
            <div className="text-xl  font-bold text-white">
              {energy.value}{" "}
              <span className="text-10 text-grey-200 font-normal">
                {energy.unit}
              </span>
            </div>
          </div>

          <div className="h-[34px] w-[1px] rounded bg-grey-200" />

          <div className="flex flex-1 flex-col items-center">
            <div className="text-xs leading-150 font-medium text-white mb-1">
              EMISSION
            </div>
            <div className="text-xl  font-bold text-white whitespace-nowrap">
              {emissions.value}{" "}
              <span className="text-10 text-grey-200 font-normal">
                {emissions.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
