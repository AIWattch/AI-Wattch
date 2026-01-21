import React from "react";
import { AIWattchLogo } from "../../icons/AIWattchLogo";
import { ChatIcon } from "../../icons/ChatIcon";
import { SettingsIcon } from "../../icons/SettingsIcon";
import { RefreshIcon } from "../../icons/RefreshIcon";
import { CloseIcon } from "../../icons/CloseIcon";

interface HeaderProps {
  onSettingsClick?: () => void;
  onRefreshClick?: () => void;
  onCloseClick?: () => void;
  hasNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSettingsClick,
  onRefreshClick,
  onCloseClick,
  hasNotification = false,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-grey-200">
      <div className="flex items-center gap-3">
        <AIWattchLogo size={24} />
        <h1 className="text-lg font-semibold text-high-emphasis font-outfit">
          AI Wattch
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {}}
          className="p-1 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <ChatIcon size={20} hasNotification={hasNotification} />
        </button>

        <button
          onClick={onSettingsClick}
          className="p-1 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <SettingsIcon size={20} />
        </button>

        <button
          onClick={onRefreshClick}
          className="p-1 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <RefreshIcon size={20} />
        </button>

        <button
          onClick={onCloseClick}
          className="p-1 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <CloseIcon size={20} />
        </button>
      </div>
    </div>
  );
};
