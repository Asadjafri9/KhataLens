import React from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

/**
 * Themed flip card. Hover (or focus) flips horizontally to reveal the back.
 * Uses project tokens — no raw colors.
 */
export const FlipCard = ({ front, back, className = "", variant = "light" }: FlipCardProps) => {
  const frontFace =
    variant === "dark"
      ? "bg-primary-darker text-background border-primary/40"
      : "bg-card text-card-foreground border-border";
  const backFace =
    variant === "dark"
      ? "bg-background text-ink border-primary/40"
      : "bg-primary text-primary-foreground border-primary";

  return (
    <div
      className={cn("group/flip [perspective:1200px] outline-none", className)}
      tabIndex={0}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] [transform-style:preserve-3d]",
          "group-hover/flip:[transform:rotateY(180deg)] group-focus/flip:[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 [backface-visibility:hidden] border p-8 flex flex-col",
            "shadow-sm transition-shadow",
            frontFace
          )}
        >
          {front}
        </div>
        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] border p-8 flex flex-col",
            "shadow-xl shadow-primary/10",
            backFace
          )}
        >
          {back}
        </div>
      </div>
    </div>
  );
};
