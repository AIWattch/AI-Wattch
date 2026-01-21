import React from "react";

interface ChevronDownIconProps {
  size?: number;
  className?: string;
  variant?: "regular" | "bold";
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  size = 16,
  className = "",
  variant = "regular",
}) => {
  return (
    <span className={`${className}`}>
      {variant === "bold" ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 8 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.63986 3.4834L4.46653 5.65673C4.20986 5.9134 3.78986 5.9134 3.5332 5.65673L1.35986 3.4834"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m13.28 5.967-4.346 4.346a1.324 1.324 0 0 1-1.867 0L2.72 5.967"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
};
