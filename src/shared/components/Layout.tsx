// import { useState } from "react";
// import { toggleModal } from "../../content/modal";
// import {
//   AIWattchLogo,
//   ChatIcon,
//   SettingsIcon,
//   RefreshIcon,
//   CloseIcon,
// } from "../../icons";
// import { ShareFeedbackModal } from "../../modules/onboarding/ShareFeedbackModal";
// import { SettingsModal } from "../../modules/settings/SettingsModal";
// import Tooltip from "./Tooltip";
// import { resetSessionData } from "../../core";
// import MinimizedIcon from "../../icons/MinimizedIcon";

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   const [showShareFeedbackModal, setShowShareFeedbackModal] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);

//   const toggleShareFeedbackModal = () => {
//     setShowShareFeedbackModal(!showShareFeedbackModal);
//   };

//   const toggleSettings = () => {
//     setShowSettings(!showSettings);
//   };
//   return (
//     <div
//       className="max-w-[216px] w-[216px] bg-white rounded-[20px] shadow-[0px_2px_10px_0px_#00000033]  border-midnight-ocean-400 max-h-[80vh] flex flex-col"
//       style={{
//         padding: "4px",
//         borderWidth: "0.2px",
//       }}
//     >
//       <div className="flex items-center justify-between py-1 px-1">
//         <button
//           onClick={() => setIsMinimized(!isMinimized)}
//           className="flex items-center gap-1"
//         >
//           <AIWattchLogo />
//           <h1 className="text-10 font-normal text-midnight-ocean-500 font-outfit whitespace-nowrap">
//             AI Wattch
//           </h1>
//         </button>

//         {isMinimized ? (
//           <button>
//             <MinimizedIcon />
//           </button>
//         ) : (
//           <div className="flex items-center gap-2">
//             <button onClick={toggleShareFeedbackModal}>
//               <Tooltip position="bottom" title="Share Feedback">
//                 <ChatIcon size={16} hasNotification={false} />
//               </Tooltip>
//             </button>

//             <button onClick={toggleSettings}>
//               <Tooltip position="bottom" title="Configure">
//                 <SettingsIcon size={16} />
//               </Tooltip>
//             </button>

//             <button onClick={() => resetSessionData()}>
//               <Tooltip position="bottom" title="Reset">
//                 <RefreshIcon size={16} />
//               </Tooltip>
//             </button>

//             <button onClick={toggleModal}>
//               <Tooltip position="bottom" title="Close">
//                 <CloseIcon size={16} />
//               </Tooltip>
//             </button>
//           </div>
//         )}
//       </div>
//       {isMinimized ? null : children}

//       {showShareFeedbackModal ? (
//         <ShareFeedbackModal onClose={toggleShareFeedbackModal} />
//       ) : null}
//       {showSettings ? <SettingsModal onClose={toggleSettings} /> : null}
//     </div>
//   );
// };

// export default Layout;

import { useState } from "react";
import { toggleModal } from "../../content/modal";
import {
  AIWattchLogo,
  ChatIcon,
  SettingsIcon,
  RefreshIcon,
  CloseIcon,
} from "../../icons";
import { ShareFeedbackModal } from "../../modules/onboarding/ShareFeedbackModal";
import { SettingsModal } from "../../modules/settings/SettingsModal";
import Tooltip from "./Tooltip";
import { resetSessionData } from "../../core";
import MinimizedIcon from "../../icons/MinimizedIcon";

const Layout = ({
  children,
  showSettings,
  setShowSettings,
  showShareFeedbackModal,
  setShowShareFeedbackModal,
}: {
  children: React.ReactNode;
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
  showShareFeedbackModal: boolean;
  setShowShareFeedbackModal: (value: boolean) => void;
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleShareFeedbackModal = () => {
    setShowShareFeedbackModal(!showShareFeedbackModal);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div
      className="bg-white rounded-[20px] shadow-[0px_2px_10px_0px_#00000033] border-midnight-ocean-400 flex flex-col"
      style={{
        padding: "4px",
        borderWidth: "0.2px",
        width: isMinimized ? "140px" : "250px",
        maxHeight: isMinimized ? "44px" : "90vh",
        transition:
          "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center justify-between py-1 px-1 flex-shrink-0">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-1 min-w-0"
        >
          <AIWattchLogo />
          <h1 className="text-sm font-medium text-midnight-ocean-500 font-outfit whitespace-nowrap overflow-hidden">
            AI Wattch
          </h1>
        </button>

        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            style={{
              opacity: isMinimized ? 1 : 0,
              transition: "opacity 0.2s ease-in-out 0.1s",
            }}
          >
            <MinimizedIcon />
          </button>
        ) : (
          <div
            className="flex items-center gap-2"
            style={{
              opacity: isMinimized ? 0 : 1,
              transition: "opacity 0.2s ease-in-out 0.1s",
            }}
          >
            <button onClick={toggleShareFeedbackModal}>
              <Tooltip position="bottom" title="Share Feedback">
                <ChatIcon size={16} hasNotification={false} />
              </Tooltip>
            </button>

            <button onClick={toggleSettings}>
              <Tooltip position="bottom" title="Configure">
                <SettingsIcon size={16} />
              </Tooltip>
            </button>

            <button
              onClick={async () => {
                setIsResetting(true);
                await resetSessionData();
                setTimeout(() => setIsResetting(false), 1000);
              }}
            >
              <Tooltip position="bottom" title="Reset">
                <RefreshIcon size={16} />
              </Tooltip>
            </button>

            <button onClick={toggleModal}>
              <Tooltip position="bottom" title="Close">
                <CloseIcon size={16} />
              </Tooltip>
            </button>
          </div>
        )}
      </div>

      {isResetting ? (
        <div className="w-full items-center justify-center flex flex-col h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glacier-400 mx-auto mb-2"></div>
            <p className="text-grey-600 font-outfit">Loading...</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            opacity: isMinimized ? 0 : 1,
            maxHeight: isMinimized ? "0px" : "90vh",
            transition:
              "opacity 0.3s ease-in-out, max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: isMinimized ? "hidden" : "auto",
            pointerEvents: isMinimized ? "none" : "auto",
          }}
          className="custom-scrollbar"
        >
          {children}
        </div>
      )}

      {/* {isMinimized ? null : children} */}
    </div>
  );
};

export default Layout;
