import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface SelectableCardProps {
  /** Whether the card is currently selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children: ReactNode;
}

export interface SelectableCardTitleProps {
  /** Icon component to display */
  icon?: ReactNode;
  /** Title content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export interface SelectableCardDescriptionProps {
  /** Description content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main selectable card container.
 * Matches the style from compliance-modules-grid.
 */
export function SelectableCard({
  selected = false,
  onClick,
  className,
  children,
}: SelectableCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer select-none rounded-lg border border-input bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-all h-full",
        selected && "border-primary bg-primary/5 text-primary",
        className
      )}
    >
      <div className="flex items-start space-x-3 h-full">{children}</div>
    </div>
  );
}

/**
 * Icon component for the selectable card.
 */
export function SelectableCardIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
      <div className="w-4 h-4">{children}</div>
    </div>
  );
}

/**
 * Content wrapper for title and description.
 */
export function SelectableCardContent({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1 flex flex-col">{children}</div>;
}

/**
 * Title component for the selectable card.
 */
export function SelectableCardTitle({
  children,
  className,
}: Omit<SelectableCardTitleProps, "icon">) {
  return (
    <div className={cn("text-sm font-medium leading-6 mb-1", className)}>
      {children}
    </div>
  );
}

/**
 * Description component for the selectable card.
 */
export function SelectableCardDescription({
  children,
  className,
}: SelectableCardDescriptionProps) {
  return (
    <div className={cn("text-sm text-muted-foreground flex-1", className)}>
      {children}
    </div>
  );
}
