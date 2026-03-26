import React from "react";
import { cn } from "@/src/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Logo({ className, iconSize = "md", textSize = "xl" }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const innerIconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("bg-black rounded-lg flex items-center justify-center shrink-0", iconSizes[iconSize])}>
        <div className={cn("bg-emerald-400 rounded-sm rotate-45", innerIconSizes[iconSize])} />
      </div>
      <span className={cn("font-bold tracking-tight text-black", textSizes[textSize])}>
        PromptPay<span className="text-emerald-600">USDT</span>
      </span>
    </div>
  );
}
