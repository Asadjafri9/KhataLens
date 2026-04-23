import { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "h1" | "h2" | "h3" | "p" | "span";
  stagger?: boolean;
  mask?: boolean;
}

export const Reveal = ({ children, className, as = "div", stagger, mask }: RevealProps) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      className={cn(
        mask ? "mask-reveal" : stagger ? "reveal-stagger" : "reveal",
        inView && "in-view",
        className
      )}
    >
      {children}
    </Tag>
  );
};
