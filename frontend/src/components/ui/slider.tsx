"use client";

import React from "react";
import { clsx } from "clsx";
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
  ...props
}: SliderProps) => {
  return (
    <div className={twMerge("flex flex-col space-y-2 w-full", className)}>
      <div className="flex justify-between items-center text-sm">
        {label && <span className="font-semibold text-foreground/80">{label}</span>}
        {displayValue && <span className="font-mono text-primary font-bold">{displayValue}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary focus:outline-none"
        {...props}
      />
    </div>
  );
};
