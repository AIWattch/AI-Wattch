import React from "react";

interface AIWattchLogoProps {
  size?: number;
  className?: string;
}

export const AIWattchLogo: React.FC<AIWattchLogoProps> = ({ size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={0.4}
        y={0.4}
        width={15.2}
        height={15.2}
        rx={7.6}
        fill="#002760"
      />
      <rect
        x={0.4}
        y={0.4}
        width={15.2}
        height={15.2}
        rx={7.6}
        stroke="#64BEFF"
        strokeWidth={0.8}
      />
      <path
        d="M8.10005 2.40002L6.67505 8.10002H9.52505L8.10005 13.8"
        fill="#FFD230"
      />
      <path
        d="M2.3999 8.67C4.2999 8.67 5.7249 7.72 6.6749 5.82C7.6249 3.92 8.5749 4.87 9.5249 8.67C10.4749 12.47 11.8999 12.47 13.7999 8.67"
        stroke="#24BD6E"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </svg>
  );
};
