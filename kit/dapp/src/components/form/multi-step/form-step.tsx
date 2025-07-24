import { cn } from "@/lib/utils";
import { type PropsWithChildren } from "react";

export function FormStep({ children }: PropsWithChildren) {
  return <div className="FormStep">{children}</div>;
}

export function FormStepTitle({ children }: PropsWithChildren) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function FormStepSubtitle({ children }: PropsWithChildren) {
  return <div className="text-sm font-medium tracking-tight">{children}</div>;
}

export function FormStepDescription({ children }: PropsWithChildren) {
  return <p className="text-sm text-muted-foreground pt-2">{children}</p>;
}

export function FormStepContent({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className={`${fullWidth ? "" : "max-w-3xl"} space-y-6 pr-2`}>
        {children}
      </div>
    </div>
  );
}

export function FormStepSubmit({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <footer className={cn("bottom-8 left-8 right-8 mt-6", className)}>
      {children}
    </footer>
  );
}

export function FormStepHeader({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col">
      <div className="mb-6">{children}</div>
    </div>
  );
}
