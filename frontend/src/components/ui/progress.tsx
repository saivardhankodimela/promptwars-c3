import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: "primary" | "secondary" | "accent";
}

export const Progress = ({ className, value, color = "primary", ...props }: ProgressProps) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div
      className={twMerge("w-full h-2.5 rounded-full bg-card-border overflow-hidden", className)}
      {...props}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500 ease-out",
          {
            "bg-primary": color === "primary",
            "bg-secondary": color === "secondary",
            "bg-accent": color === "accent",
          }
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
