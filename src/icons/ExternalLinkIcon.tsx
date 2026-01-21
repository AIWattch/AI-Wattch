import React from "react";

interface ExternalLinkIconProps {
  size?: number;
  className?: string;
}

export const ExternalLinkIcon: React.FC<ExternalLinkIconProps> = ({
  size = 14,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.794 1.334H5.207c-2.427 0-3.873 1.446-3.873 3.873v5.58c0 2.433 1.446 3.88 3.873 3.88h5.58c2.426 0 3.873-1.447 3.873-3.873V5.207c.007-2.427-1.44-3.873-3.867-3.873M11.5 8.22c0 .273-.226.5-.5.5a.504.504 0 0 1-.5-.5V6.207l-5.146 5.147c-.1.1-.227.146-.354.146a.5.5 0 0 1-.353-.146.503.503 0 0 1 0-.707L9.794 5.5H7.78a.504.504 0 0 1-.5-.5c0-.273.227-.5.5-.5H11c.274 0 .5.227.5.5z"
        fill="#002760"
      />
    </svg>
  );
};
