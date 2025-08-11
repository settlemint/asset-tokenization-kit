import { cn } from "@/lib/utils";
import { type PropsWithChildren, Children, isValidElement } from "react";

export function FormStep({ children }: PropsWithChildren) {
  return <div className="FormStep flex flex-col h-full">{children}</div>;
}

export function FormStepTitle({ children }: PropsWithChildren) {
  return <h2 className="text-2xl font-semibold -mt-1 mb-2">{children}</h2>;
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
  asGrid = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
  asGrid?: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div
        className={cn(
          "space-y-6 pr-4 pb-24",
          fullWidth ? "w-full" : "",
          asGrid ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FormStepSubmit({
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  let actionChildrenCount = 0;

  if (children) {
    const actionsArray = Children.toArray(children);

    if (actionsArray.length === 1 && isValidElement(actionsArray[0])) {
      // Check if the single element has children (like a fragment or div with multiple buttons)
      const singleElement = actionsArray[0] as React.ReactElement<{
        children?: React.ReactNode;
      }>;

      if (singleElement.props.children) {
        const nestedChildren = Children.toArray(singleElement.props.children);
        actionChildrenCount = nestedChildren.length;
      } else {
        actionChildrenCount = 1;
      }
    } else {
      actionChildrenCount = actionsArray.length;
    }
  }

  return (
    <footer
      className={cn(
        "OnboardingStepLayout__footer absolute bottom-0 left-0 right-0 p-8 flex bg-[var(--sm-background-lightest)]",
        actionChildrenCount === 1 ? "justify-end" : "justify-between"
      )}
    >
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
