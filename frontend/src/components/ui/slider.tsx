import React from "react";
import { twMerge } from "tailwind-merge";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  displayValue?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
}

export const Slider = ({
  className,
  label,
  displayValue,
  min,
  max,
  step = 1,
  value,
  onChange,
  id,
  ...props
}: SliderProps) => {
  const generatedId = React.useId();
  const actualId = id || generatedId;
  return (
    <div className={twMerge("flex flex-col space-y-2 w-full", className)}>
      <div className="flex justify-between items-center text-sm">
        {label && (
          <label htmlFor={actualId} className="font-semibold text-foreground/80">
            {label}
          </label>
        )}
        {displayValue && <span className="font-mono text-primary font-bold">{displayValue}</span>}
      </div>
      <input
        id={actualId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue || `${value}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        {...props}
      />
    </div>
  );
};
