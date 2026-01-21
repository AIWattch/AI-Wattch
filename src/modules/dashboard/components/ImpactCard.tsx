import React from "react";
import { Card } from "../../../shared/components/Card";
import { WaterDropIcon } from "../../../icons/WaterDropIcon";
import { LightBulbIcon } from "../../../icons/LightBulbIcon";
import { SmartphoneIcon } from "../../../icons/SmartphoneIcon";
import { ConsumptionByPlatform, PlatformDetails } from "../../../shared/types";

export const ImpactCard: React.FC<{
  consumptionData: ConsumptionByPlatform;
  platformDetails: PlatformDetails;
}> = ({ consumptionData, platformDetails }) => {
  // Calculate total impact metrics from both platforms
  const totalWaterConsumption =
    (consumptionData.chatgptConsumption?.metrics.waterConsumption || 0) +
    (consumptionData.claudeConsumption?.metrics.waterConsumption || 0);
  const totalLightBulbMinutes =
    (consumptionData.chatgptConsumption?.metrics.lightBulbMinutes || 0) +
    (consumptionData.claudeConsumption?.metrics.lightBulbMinutes || 0);
  const totalSmartphoneCharges =
    (consumptionData.chatgptConsumption?.metrics.smartphoneCharges || 0) +
    (consumptionData.claudeConsumption?.metrics.smartphoneCharges || 0);

  return (
    <div className="mt-3 bg-white rounded-lg p-2">
      <h3 className="text-sm font-medium text-obsidian">Sessions Impact</h3>

      <p className="text-xs text-grey-600 mt-2 mb-1">Your usage has led to</p>
      <div className="flex items-center gap-2  bg-mist  rounded overflow-hidden">
        <div className="size-5 bg-glacier-100  flex items-center justify-center">
          <WaterDropIcon />
        </div>
        <span className="text-xs font-normal text-grey-600">
          Consuming{" "}
          <span className="font-semibold text-obsidian">
            {totalWaterConsumption.toFixed(0)}L
          </span>{" "}
          of water.
        </span>
      </div>

      <div className="bg-grey-200 h-[1px] rounded my-2" />

      <div>
        <p className="text-xs text-grey-600 mb-1">
          Your usage is equivalent to
        </p>
        <div className="flex items-center gap-2 mb-1  bg-mist rounded overflow-hidden">
          <div className="size-5 bg-[#FFEFB8]  flex items-center justify-center">
            <LightBulbIcon />
          </div>
          <span className="text-xs font-normal text-grey-600">
            Lighting a bulb for{" "}
            <span className="font-semibold text-obsidian">
              {totalLightBulbMinutes.toFixed(0)}
            </span>{" "}
            {totalLightBulbMinutes.toFixed(0) === "1" ? "minute" : "minutes"}
          </span>
        </div>

        <div className="flex items-center gap-2  bg-mist rounded overflow-hidden">
          <div className="size-5 bg-grey-200  flex items-center justify-center">
            <SmartphoneIcon />
          </div>
          <span className="text-xs font-normal text-grey-600">
            Charging{" "}
            <span className="font-semibold text-obsidian">
              {totalSmartphoneCharges}
            </span>{" "}
            {totalSmartphoneCharges === 1 ? "smartphone" : "smartphones"}
          </span>
        </div>
      </div>
    </div>
  );
};
