"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StepContentProps {
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  className?: string;
  centerContent?: boolean;
}

export function StepContent({
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  nextLabel = "Continue",
  backLabel = "Back",
  showBackButton = true,
  showNextButton = true,
  className,
  centerContent = true,
}: StepContentProps) {
  return (
    <div className={cn(centerContent ? "mx-[20%]" : "", className)}>
      {children}

      {/* Navigation buttons */}
      {(showBackButton || showNextButton) && (
        <div className="mt-8 flex justify-end space-x-4">
          {showBackButton && onBack && (
            <Button variant="outline" onClick={onBack}>
              {backLabel}
            </Button>
          )}

          {showNextButton && onNext && (
            <Button
              onClick={onNext}
              disabled={isNextDisabled}
              className={isNextDisabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
