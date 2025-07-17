import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: string;
}

export interface StepperIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "pending" | "active" | "completed";
}

export interface StepperSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
);
Stepper.displayName = "Stepper";

export const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
);
StepperItem.displayName = "StepperItem";

export const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ className, status = "pending", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center rounded-full transition-all duration-300",
      status === "completed" && "bg-primary",
      status === "active" && "border-2 border-primary bg-transparent",
      status === "pending" &&
        "border-2 border-muted-foreground/30 bg-transparent",
      className
    )}
    {...props}
  >
    {status === "completed" ? (
      <Check className="w-3 h-3 text-primary-foreground" />
    ) : status === "active" ? (
      <div className="w-2 h-2 rounded-full bg-primary" />
    ) : (
      <span className="sr-only">Pending</span>
    )}
  </div>
));
StepperIndicator.displayName = "StepperIndicator";

export const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  StepperSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px bg-border flex-1 mx-2", className)}
    {...props}
  />
));
StepperSeparator.displayName = "StepperSeparator";

export const StepperTrigger = React.forwardRef<
  HTMLButtonElement,
  StepperTriggerProps
>(({ className, disabled, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center rounded-md transition-colors",
      "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
      className
    )}
    {...props}
  />
));
StepperTrigger.displayName = "StepperTrigger";
