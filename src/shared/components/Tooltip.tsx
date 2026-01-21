import React, { ReactNode, useState } from "react";

interface TooltipProps {
  title: string | ReactNode;
  children: ReactNode;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "left-top"
    | "left-bottom"
    | "right-top"
    | "right-bottom";
  className?: string;
  delayShow?: number;
  delayHide?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  position = "bottom",
  className = "",
  delayShow = 200,
  delayHide = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<any>(null);
  const [hideTimeout, setHideTimeout] = useState<any>(null);

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);

    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);

    setHideTimeout(timeout);
  };

  const getPositionClasses = () => {
    switch (position) {
      // Basic positions
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";

      // Diagonal positions - top variants
      case "top-left":
        return "bottom-full right-0 mb-2";
      case "top-right":
        return "bottom-full left-0 mb-2";

      // Diagonal positions - bottom variants
      case "bottom-left":
        return "top-full right-0 mt-2";
      case "bottom-right":
        return "top-full left-0 mt-2";

      // Diagonal positions - left variants
      case "left-top":
        return "right-full bottom-0 mr-2";
      case "left-bottom":
        return "right-full top-0 mr-2";

      // Diagonal positions - right variants
      case "right-top":
        return "left-full bottom-0 ml-2";
      case "right-bottom":
        return "left-full top-0 ml-2";

      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      // Basic positions
      case "top":
        return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-obsidian";
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-obsidian";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-obsidian";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-obsidian";

      // Diagonal positions - top variants
      case "top-left":
        return "top-full right-1 border-l-transparent border-r-transparent border-b-transparent border-t-obsidian";
      case "top-right":
        return "top-full left-1 border-l-transparent border-r-transparent border-b-transparent border-t-obsidian";

      // Diagonal positions - bottom variants
      case "bottom-left":
        return "bottom-full right-1 border-l-transparent border-r-transparent border-t-transparent border-b-obsidian";
      case "bottom-right":
        return "bottom-full left-1 border-l-transparent border-r-transparent border-t-transparent border-b-obsidian";

      // Diagonal positions - left variants
      case "left-top":
        return "left-full bottom-1 border-t-transparent border-b-transparent border-r-transparent border-l-obsidian";
      case "left-bottom":
        return "left-full top-1 border-t-transparent border-b-transparent border-r-transparent border-l-obsidian";

      // Diagonal positions - right variants
      case "right-top":
        return "right-full bottom-1 border-t-transparent border-b-transparent border-l-transparent border-r-obsidian";
      case "right-bottom":
        return "right-full top-1 border-t-transparent border-b-transparent border-l-transparent border-r-obsidian";

      default:
        return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-obsidian";
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // style={{
      //   flexShrink: 0,
      //   verticalAlign: "top",
      // }}
    >
      {children}

      {isVisible && (
        <div
          className={`absolute w-max  transition-opacity pointer-events-none px-2 py-1 text-10 text-white bg-obsidian rounded shadow-lg whitespace-normal max-w-xs ${getPositionClasses()} ${className}`}
          style={{ zIndex: 10000000, width: "max-content" }}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />

          {/* Content */}
          {title}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

// import React, { ReactNode, useState, useRef, useEffect } from "react";
// import { createPortal } from "react-dom";

// interface TooltipProps {
//   title: string | ReactNode;
//   children: ReactNode;
//   position?: "top" | "bottom" | "left" | "right";
//   className?: string;
//   delayShow?: number;
//   delayHide?: number;
//   usePortal?: boolean;
// }

// export const Tooltip: React.FC<TooltipProps> = ({
//   title,
//   children,
//   position = "bottom",
//   className = "",
//   delayShow = 200,
//   delayHide = 0,
//   usePortal = true,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [showTimeout, setShowTimeout] = useState<any | null>(null);
//   const [hideTimeout, setHideTimeout] = useState<any | null>(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
//   const triggerRef = useRef<HTMLDivElement>(null);

//   const handleMouseEnter = () => {
//     if (hideTimeout) {
//       clearTimeout(hideTimeout);
//       setHideTimeout(null);
//     }

//     const timeout = setTimeout(() => {
//       if (usePortal && triggerRef.current) {
//         updateTooltipPosition();
//       }
//       setIsVisible(true);
//     }, delayShow);

//     setShowTimeout(timeout);
//   };

//   const handleMouseLeave = () => {
//     if (showTimeout) {
//       clearTimeout(showTimeout);
//       setShowTimeout(null);
//     }

//     const timeout = setTimeout(() => {
//       setIsVisible(false);
//     }, delayHide);

//     setHideTimeout(timeout);
//   };

//   const updateTooltipPosition = () => {
//     if (!triggerRef.current) return;

//     const rect = triggerRef.current.getBoundingClientRect();
//     const scrollLeft =
//       window.pageXOffset || document.documentElement.scrollLeft;
//     const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

//     let top = 0;
//     let left = 0;

//     switch (position) {
//       case "top":
//         top = rect.top + scrollTop - 8;
//         left = rect.left + scrollLeft + rect.width / 2;
//         break;
//       case "bottom":
//         top = rect.bottom + scrollTop + 8;
//         left = rect.left + scrollLeft + rect.width / 2;
//         break;
//       case "left":
//         top = rect.top + scrollTop + rect.height / 2;
//         left = rect.left + scrollLeft - 8;
//         break;
//       case "right":
//         top = rect.top + scrollTop + rect.height / 2;
//         left = rect.right + scrollLeft + 8;
//         break;
//     }

//     setTooltipPosition({ top, left });
//   };

//   useEffect(() => {
//     if (!usePortal || !isVisible) return;

//     const updatePosition = () => updateTooltipPosition();

//     window.addEventListener("scroll", updatePosition, true);
//     window.addEventListener("resize", updatePosition);

//     return () => {
//       window.removeEventListener("scroll", updatePosition, true);
//       window.removeEventListener("resize", updatePosition);
//     };
//   }, [isVisible, usePortal, position]);

//   const getTooltipStyles = (
//     forPortal: boolean = false
//   ): React.CSSProperties => {
//     const baseStyles: React.CSSProperties = {
//       position: "absolute",
//       padding: "4px 8px",
//       fontSize: "10px",
//       fontFamily: "Outfit, sans-serif",
//       color: "white",
//       backgroundColor: "#1C1C1C", // obsidian color
//       borderRadius: "4px",
//       boxShadow:
//         "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
//       whiteSpace: "normal",
//       maxWidth: "288px", // max-w-xs equivalent
//       minWidth: "200px",
//       zIndex: 10000000000,
//     };

//     if (forPortal) {
//       return {
//         ...baseStyles,
//         top: tooltipPosition.top,
//         left: tooltipPosition.left,
//         transform: getPortalTransform(),
//       };
//     }

//     return {
//       ...baseStyles,
//       ...getPositionStyles(),
//     };
//   };

//   const getPositionStyles = (): React.CSSProperties => {
//     switch (position) {
//       case "top":
//         return {
//           bottom: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           marginBottom: "8px",
//         };
//       case "bottom":
//         return {
//           top: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           marginTop: "8px",
//         };
//       case "left":
//         return {
//           right: "100%",
//           top: "50%",
//           transform: "translateY(-50%)",
//           marginRight: "8px",
//         };
//       case "right":
//         return {
//           left: "100%",
//           top: "50%",
//           transform: "translateY(-50%)",
//           marginLeft: "8px",
//         };
//       default:
//         return {
//           bottom: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           marginBottom: "8px",
//         };
//     }
//   };

//   const getPortalTransform = (): string => {
//     switch (position) {
//       case "top":
//         return "translate(-50%, -100%)";
//       case "bottom":
//         return "translateX(-50%)";
//       case "left":
//         return "translate(-100%, -50%)";
//       case "right":
//         return "translateY(-50%)";
//       default:
//         return "translate(-50%, -100%)";
//     }
//   };

//   const getArrowStyles = (): React.CSSProperties => {
//     const baseArrowStyles: React.CSSProperties = {
//       position: "absolute",
//       width: 0,
//       height: 0,
//       borderWidth: "4px",
//       borderStyle: "solid",
//     };

//     switch (position) {
//       case "top":
//         return {
//           ...baseArrowStyles,
//           top: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           borderLeftColor: "transparent",
//           borderRightColor: "transparent",
//           borderBottomColor: "transparent",
//           borderTopColor: "#1f1f1f",
//         };
//       case "bottom":
//         return {
//           ...baseArrowStyles,
//           bottom: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           borderLeftColor: "transparent",
//           borderRightColor: "transparent",
//           borderTopColor: "transparent",
//           borderBottomColor: "#1f1f1f",
//         };
//       case "left":
//         return {
//           ...baseArrowStyles,
//           left: "100%",
//           top: "50%",
//           transform: "translateY(-50%)",
//           borderTopColor: "transparent",
//           borderBottomColor: "transparent",
//           borderRightColor: "transparent",
//           borderLeftColor: "#1f1f1f",
//         };
//       case "right":
//         return {
//           ...baseArrowStyles,
//           right: "100%",
//           top: "50%",
//           transform: "translateY(-50%)",
//           borderTopColor: "transparent",
//           borderBottomColor: "transparent",
//           borderLeftColor: "transparent",
//           borderRightColor: "#1f1f1f",
//         };
//       default:
//         return {
//           ...baseArrowStyles,
//           top: "100%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           borderLeftColor: "transparent",
//           borderRightColor: "transparent",
//           borderBottomColor: "transparent",
//           borderTopColor: "#1f1f1f",
//         };
//     }
//   };

//   const tooltipContent = isVisible && (
//     <div style={getTooltipStyles(usePortal)} className={className}>
//       {/* Arrow */}
//       <div style={getArrowStyles()} />

//       {/* Content */}
//       {title}
//     </div>
//   );

//   return (
//     <div
//       ref={triggerRef}
//       style={{
//         position: "relative",
//         display: "inline-block",
//         fontFamily: `"Outfit", sans-serif`,
//       }}
//       onMouseEnter={handleMouseEnter}
//       // onMouseLeave={handleMouseLeave}
//     >
//       {children}

//       {usePortal
//         ? isVisible && createPortal(tooltipContent, document.body)
//         : tooltipContent}
//     </div>
//   );
// };

// export default Tooltip;
