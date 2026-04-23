import { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
}

export const HandUnderline = ({ children, className }: Props) => {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        className={cn("hand-underline absolute left-0 -bottom-2 w-full", inView && "in-view")}
        viewBox="0 0 300 18"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M2 12 C 60 4, 120 16, 180 8 S 280 14, 298 6"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
};
