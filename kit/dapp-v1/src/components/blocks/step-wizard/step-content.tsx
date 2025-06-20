"use client";

import { cn } from "@/lib/utils";
import { FocusScope } from "@radix-ui/react-focus-scope";
import type { ReactNode } from "react";

interface StepContentProps {
  children: ReactNode;
  className?: string;
  centerContent?: boolean;
  fixedButtons?: boolean;
}

export function StepContent({
  children,
  className,
  centerContent = true,
  fixedButtons = false,
}: StepContentProps) {
  return (
    <FocusScope loop trapped>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Main scrollable container */}
        <div
          className="flex-1 overflow-y-auto pr-2"
          style={{ paddingBottom: fixedButtons ? "4rem" : "1rem" }}
        >
          {/* Content container with form fields */}
          <div className={cn(centerContent ? "mx-auto" : "")}>
            {/* Main content */}
            {children}
          </div>
        </div>
      </div>
    </FocusScope>
  );
}
