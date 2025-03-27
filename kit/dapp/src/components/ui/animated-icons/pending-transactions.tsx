"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface PendingTransactionsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PendingTransactionsIconProps {
  className?: string;
  hasPendingTransactions?: boolean;
}

export const PendingTransactionsIcon = forwardRef<
  PendingTransactionsIconHandle,
  PendingTransactionsIconProps
>(({ className, hasPendingTransactions = false }, ref) => {
  const isAnimating = useRef(false);

  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      isAnimating.current = true;
    },
    stopAnimation: () => {
      isAnimating.current = false;
    },
  }));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "size-5",
        !hasPendingTransactions && "text-muted-foreground",
        className
      )}
    >
      {/* Top arrow */}
      <motion.g
        animate={
          hasPendingTransactions
            ? {
                opacity: [1, 0.3, 1],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }
            : {}
        }
      >
        <line x1="7" y1="7" x2="17" y2="7" />
        <polyline points="4,7 7,7 7,4" />
        <polyline points="4,7 7,7 7,10" />
      </motion.g>
      {/* Bottom arrow */}
      <motion.g
        animate={
          hasPendingTransactions
            ? {
                opacity: [0.3, 1, 0.3],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }
            : {}
        }
      >
        <line x1="17" y1="17" x2="7" y2="17" />
        <polyline points="20,17 17,17 17,14" />
        <polyline points="20,17 17,17 17,20" />
      </motion.g>
    </svg>
  );
});

PendingTransactionsIcon.displayName = "PendingTransactionsIcon";
