import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ModalCardLayoutProps {
  children?: ReactNode;
  className?: string;
  header?: ReactNode;
}

/**
 * Reusable modal card layout that provides consistent sizing and padding.
 * Can be used both in route components and inside Dialog modals.
 * Provides the card-like appearance with proper centering and constraints.
 */
export function ModalCardLayout({
  children,
  className,
  header,
}: ModalCardLayoutProps) {
  return (
    <div
      className={cn(
        "ModalCardLayout flex flex-col h-screen relative z-40",
        className
      )}
    >
      {header}

      <div className="ModalCardLayout__card flex flex-col justify-center items-center flex-1 overflow-hidden">
        <div className="h-[85vh] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] mt-2 mb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
