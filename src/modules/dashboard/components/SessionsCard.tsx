import React, { useEffect, useState } from "react";

import { GPTLogo } from "../../../icons/GPTLogo";
import { ClaudeLogo } from "../../../icons/ClaudeLogo";

import {
  formatEmissions,
  formatEnergy,
} from "../../../shared/utils/formatting";
import { ConsumptionByPlatform, Consumption } from "../../../shared/types";
import { InfoIcon } from "lucide-react";
import { ChevronDownIcon, ChevronIcon } from "../../../icons";
import SemiCircleChart from "../../../shared/components/SemiCircleChart";
import { ImpactCard } from "./ImpactCard";
import Tooltip from "../../../shared/components/Tooltip";
import { GeminiLogo } from "../../../icons/GeminiLogo";
import { getDailyRecords, getAllTimeTotal } from "../../../lib/storageService";
import { aggregateRecords } from "../../../lib/aggregator";

type Period = "today" | "week" | "month" | "alltime";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today's Sessions",
  week: "This week's Sessions",
  month: "This month's Sessions",
  alltime: "All time Sessions",
};

const ZERO: Consumption = {
  energyKWh: 0,
  carbonEmissionsKgCO2e: 0,
  metrics: { waterConsumption: 0, lightBulbMinutes: 0, smartphoneCharges: 0 },
};

function modelDataToConsumption(data?: {
  energy_Wh: number;
  co2_g: number;
  water_ml: number;
}): Consumption {
  if (!data) return ZERO;
  const energyKWh = data.energy_Wh / 1000;
  return {
    energyKWh,
    carbonEmissionsKgCO2e: data.co2_g / 1000,
    metrics: {
      waterConsumption: data.water_ml,
      lightBulbMinutes: energyKWh / 0.005,
      smartphoneCharges: energyKWh / 0.04,
    },
  };
}

function byModelToConsumptionByPlatform(
  byModel: Record<string, { energy_Wh: number; co2_g: number; water_ml: number }>
): ConsumptionByPlatform {
  return {
    chatgptConsumption: modelDataToConsumption(byModel["ChatGPT"]),
    claudeConsumption: modelDataToConsumption(byModel["Claude"]),
    geminiConsumption: modelDataToConsumption(byModel["Gemini"]),
    currentConsumption: { chatgpt: ZERO, claude: ZERO, gemini: ZERO },
  };
}

export const SessionsCard: React.FC<{
  consumptionData: ConsumptionByPlatform;
  handleShowTips: (e: any) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}> = ({ consumptionData, handleShowTips, isExpanded, setIsExpanded }) => {
  const [activeTab, setActiveTab] = useState<"emissions" | "energy">("energy");
  const [period, setPeriod] = useState<Period>("today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [periodConsumption, setPeriodConsumption] =
    useState<ConsumptionByPlatform | null>(null);

  useEffect(() => {
    if (period === "today") {
      setPeriodConsumption(null);
      return;
    }
    (async () => {
      if (period === "week") {
        const records = await getDailyRecords(7);
        const rollup = aggregateRecords(records);
        setPeriodConsumption(byModelToConsumptionByPlatform(rollup.byModel));
      } else if (period === "month") {
        const records = await getDailyRecords(30);
        const rollup = aggregateRecords(records);
        setPeriodConsumption(byModelToConsumptionByPlatform(rollup.byModel));
      } else if (period === "alltime") {
        const total = await getAllTimeTotal();
        setPeriodConsumption(byModelToConsumptionByPlatform(total.byModel));
      }
    })();
  }, [period]);

  const activeConsumption =
    period === "today" ? consumptionData : periodConsumption ?? consumptionData;

  const getPeriodTag = (): string => {
    if (period === "today") return "Today";
    if (period === "week") {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${fmt(start)} – ${fmt(end)}`;
    }
    if (period === "month") return "Rolling 30 days";
    return "All time";
  };

  const getRadialData = () => {
    const chatgptEnergy = activeConsumption.chatgptConsumption.energyKWh || 0;
    const claudeEnergy = activeConsumption.claudeConsumption.energyKWh || 0;
    const geminiEnergy = activeConsumption.geminiConsumption.energyKWh || 0;
    const chatgptEmission =
      activeConsumption.chatgptConsumption.carbonEmissionsKgCO2e || 0;
    const claudeEmission =
      activeConsumption.claudeConsumption.carbonEmissionsKgCO2e || 0;
    const geminiEmission =
      activeConsumption.geminiConsumption.carbonEmissionsKgCO2e || 0;

    const energy = {
      total: formatEnergy(chatgptEnergy + claudeEnergy + geminiEnergy),
      chatgpt: formatEnergy(chatgptEnergy),
      claude: formatEnergy(claudeEnergy),
      gemini: formatEnergy(geminiEnergy),
      chatgptRaw: chatgptEnergy,
      claudeRaw: claudeEnergy,
      geminiRaw: geminiEnergy,
    };

    const emissions = {
      total: formatEmissions(chatgptEmission + claudeEmission + geminiEmission),
      chatgpt: formatEmissions(chatgptEmission),
      claude: formatEmissions(claudeEmission),
      gemini: formatEmissions(geminiEmission),
      chatgptRaw: chatgptEmission,
      claudeRaw: claudeEmission,
      geminiRaw: geminiEmission,
    };

    return activeTab === "emissions" ? emissions : energy;
  };

  const consumptionDataRadial = getRadialData();
  return (
    <div
      className="bg-mist rounded-2xl mt-2"
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
                sessions' AI <br></br>usage. Your data resets every<br></br> 24
                hours.
              </>
            }
          >
            <InfoIcon size={16} />
          </Tooltip>

          {/* Period dropdown trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1 text-sm font-normal"
            >
              {PERIOD_LABELS[period]}
              <ChevronDownIcon
                size={12}
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border border-grey-200 rounded-lg shadow-md z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                {(["today", "week", "month", "alltime"] as Period[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-mist flex items-center justify-between"
                    >
                      <span>{PERIOD_LABELS[p]}</span>
                      {period === p && (
                        <span className="text-glacier-500">✓</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

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
                  {
                    value: +consumptionDataRadial.geminiRaw,
                    color: "#4187F3",
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

          {/* Period tag */}
          <div className="flex justify-center mt-1">
            <span className="text-10 text-grey-500">{getPeriodTag()}</span>
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
            ) : null}

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

            {+consumptionDataRadial.gemini.value > 0 ? (
              <div key={"gemini"} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[5px] h-[5px]  rounded-full bg-[#4187F3]`}
                  ></div>

                  <GeminiLogo size={13} />

                  <span className="text-xs text-grey-600">Gemini</span>
                </div>
                <span className="text-sm font-semibold text-obsidian">
                  {consumptionDataRadial.gemini.value}{" "}
                  <span className="text-10 text-grey-600">
                    {consumptionDataRadial.gemini.unit}
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <ImpactCard consumptionData={activeConsumption} />

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
