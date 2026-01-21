import React from "react";

interface ArrowLeftIconProps {
  size?: number;
  className?: string;
}

export const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({
  size = 20,
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
          d="M4.78473 3.08994C4.68973 3.08994 4.59473 3.12494 4.51973 3.19994L1.48473 6.23494C1.33973 6.37994 1.33973 6.61994 1.48473 6.76494L4.51973 9.79994C4.66473 9.94494 4.90473 9.94494 5.04973 9.79994C5.19473 9.65494 5.19473 9.41494 5.04973 9.26994L2.27973 6.49994L5.04973 3.72994C5.19473 3.58494 5.19473 3.34494 5.04973 3.19994C4.97973 3.12494 4.87973 3.08994 4.78473 3.08994Z"
          fill="currentColor"
        />
        <path
          d="M10.25 6.125H1.83496C1.62996 6.125 1.45996 6.295 1.45996 6.5C1.45996 6.705 1.62996 6.875 1.83496 6.875H10.25C10.455 6.875 10.625 6.705 10.625 6.5C10.625 6.295 10.455 6.125 10.25 6.125Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
};
