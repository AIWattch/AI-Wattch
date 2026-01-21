import React from "react";

export const CheckIcon = () => {
  return <div>CheckIcon</div>;
};

export const CheckCircleIcon = ({ size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 1.334C4.827 1.334 1.833 4.326 1.833 8s2.994 6.667 6.667 6.667S15.167 11.674 15.167 8 12.173 1.334 8.5 1.334m3.187 5.133-3.78 3.78a.5.5 0 0 1-.707 0L5.313 8.36a.503.503 0 0 1 0-.706.503.503 0 0 1 .707 0l1.533 1.533L10.98 5.76a.503.503 0 0 1 .707 0 .503.503 0 0 1 0 .707"
        fill="#64BEFF"
      />
    </svg>
  );
};
