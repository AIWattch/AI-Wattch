// import { ArrowRightIcon } from "../../icons/ArrowRightIcon";
import {
  allowEmissionTracking,
  markWelcomeAsSeen,
} from "../../core/storage/settings";
import { CheckCircleIcon, ChevronIcon } from "../../icons";
import { useEffect, useState } from "react";
import { useCurrentPlatform } from "../../shared/hooks/useCurrentPlatform";
import { useConsumptionData } from "../../shared/hooks/useConsumptionData";

const Welcome = ({
  setCurrentView,
}: {
  setCurrentView: (view: string) => void;
}) => {
  const [welcomeStep, setWelcomeStep] = useState(1);
  const { currentModel, isLoading } = useCurrentPlatform();
  const { consumptionData, loading } = useConsumptionData();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (welcomeStep === 2) {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [currentModel?.modelName, welcomeStep]);

  const handleGetStarted = async () => {
    try {
      const hasCarbonData = [
        consumptionData.currentConsumption?.chatgpt?.carbonEmissionsKgCO2e,
        consumptionData.currentConsumption?.claude?.carbonEmissionsKgCO2e,
        consumptionData.chatgptConsumption?.carbonEmissionsKgCO2e,
        consumptionData.claudeConsumption?.carbonEmissionsKgCO2e,
      ].some(Boolean);

      if (hasCarbonData && welcomeStep === 2) {
        await markWelcomeAsSeen();
        setCurrentView("dashboard");
      }
    } catch (error) {
      console.error("Failed to mark welcome as seen:", error);
      setCurrentView("dashboard");
    }
  };

  useEffect(() => {
    handleGetStarted();
  }, [consumptionData]);

  return (
    <div className=" w-full items-center justify-center">
      {welcomeStep === 1 && (
        <>
          <div className="my-4">
            <h2 className="text-lg font-medium leading-125  text-obsidian mb-1 font-outfit text-center">
              Welcome to AI Wattch!
            </h2>
            <p className="text-grey-600 leading-150  text-sm font-outfit text-center">
              Track emissions from AI prompts.
            </p>
          </div>
          <button
            className="bg-glacier-400  border-midnight-ocean-400 flex items-center justify-center gap-2 rounded-full  px-4 py-2 h-8 text-sm font-medium text-midnight-ocean-500 w-full"
            style={{ borderWidth: "0.5px" }}
            onClick={async () => {
              await allowEmissionTracking();
              setWelcomeStep(welcomeStep + 1);
            }}
          >
            Get Started
            <ChevronIcon size={16} />
          </button>
        </>
      )}

      {welcomeStep === 2 && (
        <div className="w-full bg-mist mt-2 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-lg leading-125 font-medium text-obsidian py-2 font-outfit text-center">
            How to use AI Wattch
          </h3>

          <div className="mb-2 relative min-w-[130.79px] z-10">
            <div className="absolute left-[-15.5px] top-3 h-11 w-[1px] bg-glacier-400 z-[-1]"></div>

            <div className="flex items-center gap-1 relative left-[-19px]">
              <div className="w-2 h-2 bg-glacier-500 rounded-full flex-shrink-0 relative top-[1px]" />
              <span className="text-xs font-outfit text-grey-600 font-normal pt-0.5">
                Enter your prompt.
              </span>
            </div>

            <div className="flex items-center gap-1 my-1 relative left-[-19px]">
              <div className="w-2 h-2 bg-glacier-500 rounded-full flex-shrink-0 relative top-[1px]" />
              <span className="text-xs font-outfit text-grey-600 font-normal pt-0.5">
                Get your AI answer.
              </span>
            </div>

            <div className="flex items-center gap-1 relative left-[-19px]">
              <div className="w-2 h-2 bg-glacier-500 rounded-full flex-shrink-0 relative top-[1px]" />
              <span className="text-xs font-outfit text-grey-600 font-normal pt-0.5">
                See the impact.
              </span>
            </div>
          </div>

          <button
            className="bg-midnight-ocean-500  flex items-center justify-center gap-2 rounded-full px-4 py-2 h-8 text-xs font-medium text-glacier-500 w-full"
            onClick={handleGetStarted}
          >
            {currentModel?.modelName &&
            !isLoading &&
            !isAnalyzing &&
            !loading ? (
              <>
                {currentModel?.modelName}
                <CheckCircleIcon />
              </>
            ) : (
              <>
                Analyzing AI Model
                <div className="relative">
                  <div className="w-3.5 h-3.5 border-2 border-white rounded-full"></div>
                  <div className="absolute inset-0 w-3.5 h-3.5 border-2 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              </>
            )}
            {/* <ChevronIcon size={16} /> */}
          </button>
        </div>
      )}
    </div>
  );
};

export default Welcome;
