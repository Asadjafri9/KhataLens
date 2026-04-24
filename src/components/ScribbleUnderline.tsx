import React from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ScribbleUnderline = ({ children, delay = 0, className = "" }: Props) => {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.svg
        className="absolute -bottom-2 left-0 w-full h-4 z-0 pointer-events-none text-primary"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
      >
        <motion.path
          d="M0,15 Q30,5 50,15 T100,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: {
                pathLength: { delay, duration: 0.8, ease: "easeOut" },
                opacity: { delay, duration: 0.2 },
              },
            },
          }}
        />
      </motion.svg>
    </span>
  );
};
