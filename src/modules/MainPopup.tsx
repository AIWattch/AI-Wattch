import React, { useState, useEffect } from "react";
import { loadSettings } from "../core/storage/settings";

import { TipsPage } from "./tips/TipsPage";
import Welcome from "./onboarding/Welcome";
import { Dashboard } from "./dashboard/Dashboard";
import Layout from "../shared/components/Layout";
import { useDraggable } from "../shared/hooks/useDraggable";
import { ShareFeedbackModal } from "./onboarding/ShareFeedbackModal";
import { SettingsModal } from "./settings/SettingsModal";
// import "../index.css";

export const Popup: React.FC = () => {
  const [key, setKey] = useState(1);
  const [currentView, setCurrentView] = useState<
    "welcome" | "dashboard" | "tips"
  >("welcome");
  const [isTodaySessionExpanded, setIsTodaySessionExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareFeedbackModal, setShowShareFeedbackModal] = useState(false);

  const draggableProps = useDraggable({
    disabled: showSettings || showShareFeedbackModal,
  });

  // useEffect(() => {
  //   const handleVisibility = () => {
  //     if (document.visibilityState === "visible") {
  //       setKey((k) => k + 1);
  //     }
  //   };
  //   document.addEventListener("visibilitychange", handleVisibility);
  //   return () =>
  //     document.removeEventListener("visibilitychange", handleVisibility);
  // });

  // Check if user has seen welcome screen before
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const settings = await loadSettings();
        if (settings.hasSeenWelcome) {
          setCurrentView("dashboard");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWelcomeStatus();
  }, []);

  const handleShowTips = () => {
    setCurrentView("tips");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  // Show loading state while checking welcome status

  let content = (
    <Dashboard
      handleShowTips={handleShowTips}
      setShowSettings={setShowSettings}
      setIsTodaySessionExpanded={setIsTodaySessionExpanded}
      isTodaySessionExpanded={isTodaySessionExpanded}
    />
  );

  if (isLoading) {
    content = (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-grey-200 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === "welcome")
    content = (
      <Welcome
        setCurrentView={(view) =>
          setCurrentView(view as "welcome" | "dashboard" | "tips")
        }
      />
    );

  if (currentView === "tips")
    content = <TipsPage onBack={handleBackToDashboard} />;

  const toggleShareFeedbackModal = () => {
    setShowShareFeedbackModal(!showShareFeedbackModal);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <>
      <div className="modal-content" {...draggableProps}>
        <Layout
          key={key}
          setShowSettings={setShowSettings}
          showSettings={showSettings}
          showShareFeedbackModal={showShareFeedbackModal}
          setShowShareFeedbackModal={setShowShareFeedbackModal}
        >
          {content}
        </Layout>
      </div>
      {showShareFeedbackModal ? (
        <ShareFeedbackModal onClose={toggleShareFeedbackModal} />
      ) : null}
      {showSettings ? <SettingsModal onClose={toggleSettings} /> : null}
    </>
  );
};
