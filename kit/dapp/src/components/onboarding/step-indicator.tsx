import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  isCompleted: boolean;
  isCurrent: boolean;
  className?: string;
}

export function StepIndicator({
  isCompleted,
  isCurrent,
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 h-6 w-6 opacity-70 text-primary-foreground transition-all duration-300 ease-in-out",
        isCurrent && "opacity-100",
        className
      )}
    >
      <div className="transition-all duration-300 ease-in-out flex items-center justify-center">
        {isCompleted ? (
          <div className="flex items-center justify-center w-5 h-5 bg-background rounded-full">
            <Check className="w-3 h-3 text-primary" />
          </div>
        ) : isCurrent ? (
          <div className="flex items-center justify-center w-7 h-7">
            <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-current rounded-full" />
            </div>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-current rounded-full" />
        )}
      </div>
    </div>
  );
}
