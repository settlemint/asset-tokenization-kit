import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  type PropsWithChildren,
  Children,
  isValidElement,
  useState,
} from "react";

export function FormStep({ children }: PropsWithChildren) {
  return <div className="FormStep flex flex-col h-full">{children}</div>;
}

export function FormStepTitle({ children }: PropsWithChildren) {
  return <h2 className="text-2xl font-semibold -mt-1 mb-2">{children}</h2>;
}

export function FormStepSubtitle({
  children,
  icon,
}: PropsWithChildren<{ icon?: React.ReactNode }>) {
  return (
    <div className="text-sm font-medium tracking-tight flex items-center gap-2">
      {icon}
      {children}
    </div>
  );
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
    <div className="flex-1 min-h-0">
      <div
        className={cn(
          "space-y-6",
          fullWidth ? "w-full" : "",
          asGrid ? "grid grid-cols-1 md:grid-cols-2 gap-x-6" : ""
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
        actionChildrenCount <= 1 ? "justify-end" : "justify-between"
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

interface FormSummaryCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function FormSummaryCard({
  title,
  description,
  icon,
  children,
}: FormSummaryCardProps) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface FormSummaryItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
  secret?: boolean;
}

export function FormSummaryItem({
  label,
  value,
  secret = false,
}: FormSummaryItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {secret && !isVisible ? "••••••••" : value}
        </span>
        {secret && (
          <button
            type="button"
            onClick={() => {
              setIsVisible(!isVisible);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isVisible ? "Hide value" : "Show value"}
          >
            {isVisible ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
