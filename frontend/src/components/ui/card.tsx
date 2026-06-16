import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card = ({ className, glow, children, ...props }: CardProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          "relative rounded-2xl border border-card-border bg-card p-6 backdrop-blur-md shadow-2xl transition-all duration-300",
          {
            "shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] border-primary/30": glow
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("mb-4 flex flex-col space-y-1.5", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={twMerge("text-lg font-bold leading-none tracking-tight text-foreground", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={twMerge("text-sm text-foreground/60", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("flex items-center pt-4 border-t border-card-border/40 mt-4", className)} {...props}>
    {children}
  </div>
);
