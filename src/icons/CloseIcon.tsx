import React from "react";

interface CloseIconProps {
  size?: number;
}

export const CloseIcon: React.FC<CloseIconProps> = ({ size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.333C4.327 1.333 1.334 4.327 1.334 8S4.326 14.667 8 14.667 14.667 11.673 14.667 8 11.674 1.333 8 1.333m2.24 8.2a.503.503 0 0 1 0 .707.495.495 0 0 1-.707 0L8 8.707 6.467 10.24a.495.495 0 0 1-.707 0 .503.503 0 0 1 0-.707L7.294 8 5.76 6.467a.503.503 0 0 1 0-.707.503.503 0 0 1 .707 0L8 7.293 9.534 5.76a.503.503 0 0 1 .706 0 .503.503 0 0 1 0 .707L8.707 8z"
        fill="#002760"
      />
    </svg>
  );
};
