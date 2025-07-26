import { cn } from "@/lib/utils";
import { type PropsWithChildren, Children, isValidElement } from "react";

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
      <div className={cn("space-y-6 pr-2", !fullWidth && "max-w-3xl")}>
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
        "OnboardingStepLayout__footer absolute bottom-8 max-w-3xl mt-6 w-full flex",
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
