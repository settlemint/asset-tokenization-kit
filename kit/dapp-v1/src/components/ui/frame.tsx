"use client";

import { cn } from "@/lib/utils";
import type { Transition } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface FrameIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FrameIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
};

const FrameIcon = forwardRef<FrameIconHandle, FrameIconProps>(
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
        className={cn(className)}
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
          <motion.line
            variants={{
              animate: { y: -4 },
              normal: {
                x: 0,
                rotate: 0,
                y: 0,
              },
            }}
            animate={controls}
            transition={defaultTransition}
            x1={22}
            x2={2}
            y1={6}
            y2={6}
          />
          <motion.line
            variants={{
              animate: { y: 4 },
              normal: {
                x: 0,
                rotate: 0,
                y: 0,
              },
            }}
            animate={controls}
            transition={defaultTransition}
            x1={22}
            x2={2}
            y1={18}
            y2={18}
          />
          <motion.line
            variants={{
              animate: { x: -4 },
              normal: {
                x: 0,
                rotate: 0,
                y: 0,
              },
            }}
            animate={controls}
            transition={defaultTransition}
            x1={6}
            x2={6}
            y1={2}
            y2={22}
          />
          <motion.line
            variants={{
              animate: { x: 4 },
              normal: {
                x: 0,
                rotate: 0,
                y: 0,
              },
            }}
            animate={controls}
            transition={defaultTransition}
            x1={18}
            x2={18}
            y1={2}
            y2={22}
          />
        </svg>
      </div>
    );
  }
);

FrameIcon.displayName = "FrameIcon";

export { FrameIcon };
