import { Children, isValidElement } from "react";

export function OnboardingStepLayout({
                                       title,
                                       description,
                                       actions,
                                       children,
                                       fullWidth = false,
                                     }: {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  // More robust way to detect multiple action items
  let actionChildrenCount = 0;

  if (actions) {
    const actionsArray = Children.toArray(actions);

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
    <>
      <div className="OnboardingStepLayout flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground pt-2">{description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className={`${fullWidth ? "" : "max-w-3xl"} space-y-6 pr-2`}>
          {children}
        </div>
      </div>
      {actions && (
        <footer
          className={`OnboardingStepLayout__footer absolute bottom-8 right-8 max-w-3xl mt-6 w-full flex ${
            actionChildrenCount === 1 ? "justify-end" : "justify-between"
          }`}
        >
          {actions}
        </footer>
      )}
    </>
  );
}
