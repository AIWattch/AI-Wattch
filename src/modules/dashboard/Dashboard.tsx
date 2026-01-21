import React from "react";

import { MetricsCard } from "./components/MetricsCard";
import { SessionsCard } from "./components/SessionsCard";

import { useConsumptionData } from "../../shared/hooks/useConsumptionData";
import { useCurrentPlatform } from "../../shared/hooks/useCurrentPlatform";

export const Dashboard: React.FC<{
  handleShowTips: () => void;
  setShowSettings: (value: boolean) => void;
  isTodaySessionExpanded: boolean;
  setIsTodaySessionExpanded: (value: boolean) => void;
}> = ({
  handleShowTips,
  setShowSettings,
  isTodaySessionExpanded,
  setIsTodaySessionExpanded,
}) => {
  const { consumptionData, loading } = useConsumptionData();
  const platform = useCurrentPlatform();

  if (loading) {
    return (
      <div className="w-full items-center justify-center flex flex-col h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glacier-400 mx-auto mb-2"></div>
          <p className="text-grey-600 font-outfit">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full items-center justify-center bg-midnight-ocean-500 mt-1 rounded-[18px]">
      <MetricsCard
        consumptionData={consumptionData}
        platformDetails={platform}
        setShowSettings={setShowSettings}
      />

      <div
        style={{
          padding: 2,
        }}
      >
        <SessionsCard
          consumptionData={consumptionData}
          platformDetails={platform}
          handleShowTips={handleShowTips}
          isExpanded={isTodaySessionExpanded}
          setIsExpanded={setIsTodaySessionExpanded}
        />
      </div>
    </div>
  );
};
