import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80",
    secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
    outline: "text-neutral-950",
    destructive: "border-transparent bg-rose-500 text-neutral-50 hover:bg-rose-500/80",
    success: "border-transparent bg-blue-500 text-neutral-50 hover:bg-blue-500/80",
    warning: "border-transparent bg-amber-500 text-neutral-50 hover:bg-amber-500/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
