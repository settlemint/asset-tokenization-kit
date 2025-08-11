import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ModalCardLayoutProps {
  children?: ReactNode;
  className?: string;
  header?: ReactNode;
  topRightOverlay?: ReactNode;
}

/**
 * Reusable modal card layout that provides consistent sizing and padding.
 * Can be used both in route components and inside Dialog modals.
 * Provides the card-like appearance with proper centering and constraints.
 */
export function DialogCardLayout({
  children,
  className,
  header,
  topRightOverlay,
}: ModalCardLayoutProps) {
  return (
    <div
      className={cn(
        "DialogCardLayout flex flex-col h-screen relative",
        className
      )}
    >
      {header}

      <div className="DialogCardLayout__card flex flex-col justify-center items-center flex-1 overflow-hidden">
        <div className="relative h-[85vh] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] mt-2 mb-10">
          {topRightOverlay && (
            <div className="absolute right-4 z-50 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] mt-2 mb-10">
              {topRightOverlay}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
