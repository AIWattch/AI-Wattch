import React from "react";

interface IndiaFlagIconProps {
  size?: number;
  className?: string;
}

export const IndiaFlagIcon: React.FC<IndiaFlagIconProps> = ({
  size = 16,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="16" rx="2" fill="#FF9933" />
      <rect y="5.33" width="24" height="5.33" fill="white" />
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      <circle cx="12" cy="8" r="1.5" fill="#000080" />
      <path d="M12 6.5L12.5 7.5L11.5 7.5L12 6.5Z" fill="#000080" />
    </svg>
  );
};
