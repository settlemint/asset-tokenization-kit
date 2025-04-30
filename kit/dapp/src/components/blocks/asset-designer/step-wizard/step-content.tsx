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
  fixedButtons?: boolean;
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
  fixedButtons = false,
}: StepContentProps) {
  const ButtonContent = () => (
    <>
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
    </>
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Main scrollable container */}
      <div
        className="flex-1 overflow-y-auto pr-2"
        style={{ paddingBottom: fixedButtons ? "4rem" : "1rem" }}
      >
        {/* Content container */}
        <div className={cn(centerContent ? "mx-auto" : "")}>
          {/* Main content */}
          {children}

          {/* Show buttons within scroll area if not fixed */}
          {!fixedButtons && (showBackButton || showNextButton) && (
            <div className="mt-6 py-4 flex justify-end space-x-4">
              <ButtonContent />
            </div>
          )}
        </div>
      </div>

      {/* Only show fixed buttons at bottom if fixedButtons is true */}
      {fixedButtons && (showBackButton || showNextButton) && (
        <div className="pt-4 mt-auto">
          <div
            className={cn(
              "flex justify-end space-x-4",
              centerContent ? "mx-auto" : ""
            )}
          >
            <ButtonContent />
          </div>
        </div>
      )}
    </div>
  );
}
