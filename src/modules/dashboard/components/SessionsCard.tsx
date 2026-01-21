import React, { useState } from "react";

import { GPTLogo } from "../../../icons/GPTLogo";
import { ClaudeLogo } from "../../../icons/ClaudeLogo";

import {
  formatEmissions,
  formatEnergy,
} from "../../../shared/utils/formatting";
import { ConsumptionByPlatform, PlatformDetails } from "../../../shared/types";
import { InfoIcon } from "lucide-react";
import { ChevronDownIcon, ChevronIcon } from "../../../icons";
import SemiCircleChart from "../../../shared/components/SemiCircleChart";
import { ImpactCard } from "./ImpactCard";
import Tooltip from "../../../shared/components/Tooltip";

export const SessionsCard: React.FC<{
  consumptionData: ConsumptionByPlatform;
  platformDetails: PlatformDetails;
  handleShowTips: (e: any) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}> = ({
  consumptionData,
  platformDetails,
  handleShowTips,
  isExpanded,
  setIsExpanded,
}) => {
  const [activeTab, setActiveTab] = useState<"emissions" | "energy">("energy");

  const { currentModel } = platformDetails;

  const consumption =
    currentModel?.platform === "chatgpt"
      ? consumptionData.chatgptConsumption
      : consumptionData.claudeConsumption;

  const getRadialData = () => {
    const chatgptEnergy = consumptionData.chatgptConsumption.energyKWh || 0;
    const claudeEnergy = consumptionData.claudeConsumption.energyKWh || 0;
    const chatgptEmission =
      consumptionData.chatgptConsumption.carbonEmissionsKgCO2e || 0;
    const claudeEmission =
      consumptionData.claudeConsumption.carbonEmissionsKgCO2e || 0;

    const energy = {
      total: formatEnergy(chatgptEnergy + claudeEnergy),
      chatgpt: formatEnergy(chatgptEnergy),
      claude: formatEnergy(claudeEnergy),
      chatgptRaw: chatgptEnergy,
      claudeRaw: claudeEnergy,
    };

    const emissions = {
      total: formatEmissions(chatgptEmission + claudeEmission),
      chatgpt: formatEmissions(chatgptEmission),
      claude: formatEmissions(claudeEmission),
      chatgptRaw: chatgptEmission,
      claudeRaw: claudeEmission,
    };

    return activeTab === "emissions" ? emissions : energy;
  };

  const consumptionDataRadial = getRadialData();
  return (
    <div
      className="bg-mist rounded-2xl mt-2"
      // style={{
      //   marginLeft: "2px",
      //   marginRight: "2px",
      //   marginBottom: "2px",
      // }}
    >
      {/* Header */}
      {+consumptionDataRadial.total.value > 0 ? (
        <div
          role="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-2 text-midnight-ocean-500 py-2"
        >
          <Tooltip
            position="bottom-right"
            title={
              <>
                See the total environmental<br></br> impact of all your
                sessions’ AI <br></br>usage. Your data resets every<br></br> 24
                hours.
              </>
            }
          >
            <InfoIcon size={16} />
          </Tooltip>
          <h3 className="text-sm font-normal ">Today's Sessions</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-grey-100 rounded"
          >
            <ChevronDownIcon
              size={16}
              className={`transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      ) : null}

      {isExpanded && +consumptionDataRadial.total.value > 0 && (
        <div className="py-2 mx-2 border-t border-grey-200">
          {/* Toggle Buttons */}
          <div className="flex gap-[1px]">
            <button
              onClick={() => setActiveTab("energy")}
              className={`flex-1 h-[21px] flex items-center justify-center rounded-full text-10 font-medium transition-all duration-200 ${
                activeTab === "energy"
                  ? "bg-glacier-400 text-midnight-ocean-500 "
                  : " text-grey-500 hover:text-grey-600 hover:bg-grey-100"
              }`}
            >
              TOTAL ENERGY
            </button>
            <button
              onClick={() => setActiveTab("emissions")}
              className={`flex-1 h-[21px] flex items-center justify-center rounded-full text-10 font-medium transition-all duration-200 ${
                activeTab === "emissions"
                  ? "bg-glacier-400 text-midnight-ocean-500 "
                  : " text-grey-500 hover:text-grey-600 hover:bg-grey-100"
              }`}
            >
              TOTAL EMISSIONS
            </button>
          </div>

          {/* Circular Progress */}
          <div className="flex justify-center mt-2">
            <div className="relative">
              <SemiCircleChart
                key={activeTab}
                data={[
                  {
                    value: +consumptionDataRadial.chatgptRaw,
                    color: "#000000",
                  },
                  {
                    value: +consumptionDataRadial.claudeRaw,
                    color: "#D97757",
                  },
                ]}
              />
              <div
                className="absolute "
                style={{
                  top: "18px",
                  width: "97px",
                  height: "48.5px",
                  maxHeight: "48.5px",
                  overflow: "hidden",

                  left: "50%",
                  transform: "translate(-50%, 0%)",
                }}
              >
                <div
                  className=" flex  justify-center"
                  style={{
                    background:
                      "radial-gradient(117.69% 50% at 50% 0%, #FFFFFF 45.31%, #F0F5FB 100%)",
                    width: "97px",
                    height: "97px",
                    borderRadius: "50%",
                  }}
                >
                  <div className="text-center relative" style={{ top: "13px" }}>
                    <div className="text-sm font-semibold text-obsidian">
                      {consumptionDataRadial.total.value}
                    </div>
                    <div className="text-10 text-grey-600">
                      {consumptionDataRadial.total.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="space-y-1 mt-2 px-4">
            {+consumptionDataRadial.chatgpt.value > 0 ? (
              <div
                key={"chatgpt"}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[5px] h-[5px] rounded-full bg-black`}
                  ></div>

                  <GPTLogo size={13} fill="#000" />

                  <span className="text-xs text-grey-600">ChatGPT</span>
                </div>
                <span className="text-sm font-semibold text-obsidian">
                  {consumptionDataRadial.chatgpt.value}{" "}
                  <span className="text-10 text-grey-600">
                    {consumptionDataRadial.chatgpt.unit}
                  </span>
                </span>
              </div>
            ) : (
              0
            )}

            {+consumptionDataRadial.claude.value > 0 ? (
              <div key={"claude"} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[5px] h-[5px]  rounded-full ${"bg-pumpkin-flipper"}`}
                  ></div>

                  <ClaudeLogo size={13} />

                  <span className="text-xs text-grey-600">Claude</span>
                </div>
                <span className="text-sm font-semibold text-obsidian">
                  {consumptionDataRadial.claude.value}{" "}
                  <span className="text-10 text-grey-600">
                    {consumptionDataRadial.claude.unit}
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <ImpactCard
            consumptionData={consumptionData}
            platformDetails={platformDetails}
          />

          <button
            onClick={handleShowTips}
            className="bg-glacier-400 hover:bg-glacier-500 mt-3 border border-midnight-ocean-400 hover:border-midnight-ocean-500 flex items-center justify-between rounded-lg   px-1.5 py-2 h-8 text-sm  text-midnight-ocean-500 w-full"
          >
            How to improve your prompts
            <ChevronIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
