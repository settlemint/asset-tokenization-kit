"use client";

import { cn } from "@/lib/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface SquareStackIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SquareStackIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// Animation variants for the bottom square (first in stack)
const bottomSquareVariants: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [1, 0.3, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

// Animation variants for the middle square
const middleSquareVariants: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

// Animation variants for the top square (last in stack)
const topSquareVariants: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: 0.4, // Offset the animation to create alternating effect
    },
  },
};

const SquareStackIcon = forwardRef<SquareStackIconHandle, SquareStackIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate");
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal");
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(
          `cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center`,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Bottom square */}
          <motion.path
            variants={bottomSquareVariants}
            animate={controls}
            d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"
          />
          {/* Middle square */}
          <motion.path
            d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"
            variants={middleSquareVariants}
            animate={controls}
          />
          {/* Top square (main square) */}
          <motion.rect
            variants={topSquareVariants}
            width="8"
            height="8"
            x="14"
            y="14"
            rx="2"
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);

SquareStackIcon.displayName = "SquareStackIcon";

export { SquareStackIcon };
