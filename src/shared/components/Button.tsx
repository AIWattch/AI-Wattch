import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  icon,
}) => {
  const baseClasses =
    "font-outfit font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-glacier-500 hover:bg-glacier-600 text-white focus:ring-glacier-500",
    secondary:
      "bg-grey-100 hover:bg-grey-200 text-high-emphasis focus:ring-grey-300",
    outline:
      "border border-grey-300 hover:bg-grey-100 text-high-emphasis focus:ring-grey-300",
    ghost: "hover:bg-grey-100 text-high-emphasis focus:ring-grey-300",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
      </div>
    </button>
  );
};
