"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button = ({
  className,
  variant = "primary",
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            "bg-primary text-background hover:bg-primary-hover shadow-lg shadow-primary/20": variant === "primary",
            "bg-secondary text-background hover:bg-secondary-hover shadow-lg shadow-secondary/20": variant === "secondary",
            "border border-primary/40 text-primary hover:bg-primary/10": variant === "outline",
            "bg-eco-toxic/20 text-eco-toxic border border-eco-toxic/30 hover:bg-eco-toxic/30": variant === "danger",
            "text-foreground hover:bg-foreground/5": variant === "ghost"
          }
        ),
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
