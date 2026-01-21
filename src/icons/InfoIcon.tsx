import React from "react";

interface InfoIconProps {
  size?: number;
  className?: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({
  size = 14,
  className = "",
}) => {
  return (
    <span className={`${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 1.125A5.38 5.38 0 0 0 .625 6.5 5.38 5.38 0 0 0 6 11.875 5.38 5.38 0 0 0 11.375 6.5 5.38 5.38 0 0 0 6 1.125m0 10A4.63 4.63 0 0 1 1.375 6.5 4.63 4.63 0 0 1 6 1.875 4.63 4.63 0 0 1 10.625 6.5 4.63 4.63 0 0 1 6 11.125"
          fill="currentColor"
        />
        <path
          d="M6 5.625A.38.38 0 0 0 5.625 6v2.5c0 .205.17.375.375.375s.375-.17.375-.375V6A.38.38 0 0 0 6 5.625M6 4a.5.5 0 0 0-.19.04.6.6 0 0 0-.165.105c-.045.05-.08.1-.105.165a.5.5 0 0 0-.04.19q.001.099.04.19.037.09.105.165.075.067.165.105a.5.5 0 0 0 .38 0 .6.6 0 0 0 .165-.105.6.6 0 0 0 .105-.165.5.5 0 0 0 .04-.19.5.5 0 0 0-.04-.19.5.5 0 0 0-.105-.165.6.6 0 0 0-.165-.105A.5.5 0 0 0 6 4"
          fill="currentColor"
        />
      </svg>
    </span>
  );
};
