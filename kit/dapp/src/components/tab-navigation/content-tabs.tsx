import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Defines a single tab item for the ContentTabs component.
 * Each item represents a tab trigger in the tab list.
 */
export interface ContentTabItem {
  /** Unique identifier for the tab, used to link triggers to content panels */
  value: string;
  /** Display label for the tab trigger (can be text or React elements) */
  label: ReactNode;
  /** Optional tooltip text shown on hover */
  description?: string;
}

type ContentTabsBaseProps = Omit<
  React.ComponentProps<typeof TabsPrimitive.Root>,
  "aria-label" | "aria-labelledby"
> & {
  /** Array of tab items defining the available tabs */
  items: ContentTabItem[];
  /** Tab content panels (should be ContentTabsContent components with matching values) */
  children: ReactNode;
};

type ContentTabsProps = ContentTabsBaseProps &
  (
    | {
        /** Accessible label for the tab group (required for screen readers) */
        "aria-label": string;
        "aria-labelledby"?: never;
      }
    | {
        "aria-label"?: never;
        /** ID of element that labels the tab group (alternative to aria-label) */
        "aria-labelledby": string;
      }
  );

/**
 * Content-based tabbed navigation component with border-bottom styling.
 * Combines the visual aesthetics of TabNavigation with Radix Tabs functionality.
 * Uses an underline indicator for active tabs without relying on router navigation.
 *
 * @example
 * ```tsx
 * <ContentTabs
 *   defaultValue="general"
 *   aria-label="Settings tabs"
 *   items={[
 *     { value: "general", label: "General" },
 *     { value: "advanced", label: "Advanced" }
 *   ]}
 * >
 *   <ContentTabsContent value="general">
 *     General settings content
 *   </ContentTabsContent>
 *   <ContentTabsContent value="advanced">
 *     Advanced settings content
 *   </ContentTabsContent>
 * </ContentTabs>
 * ```
 */
export function ContentTabs({
  items,
  children,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ContentTabsProps) {
  return (
    <TabsPrimitive.Root
      className={cn("space-y-6", className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      <div className="overflow-x-auto">
        <TabsPrimitive.List className="flex w-full justify-start border-b">
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              title={item.description}
              className={cn(
                "group/tab relative inline-flex h-10 items-center px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "data-[state=active]:font-semibold data-[state=active]:text-foreground",
                "data-[state=inactive]:text-muted-foreground"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-accent transition-transform duration-200 ease-out group-hover/tab:scale-x-100",
                  "group-data-[state=active]/tab:scale-x-100"
                )}
              />
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </div>
      {children}
    </TabsPrimitive.Root>
  );
}

/**
 * Content panel for a single tab in the ContentTabs component.
 * Must be used as a child of ContentTabs with a value matching one of the tab items.
 *
 * @example
 * ```tsx
 * <ContentTabsContent value="general">
 *   Your content here
 * </ContentTabsContent>
 * ```
 */
export function ContentTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content className={cn("space-y-4", className)} {...props} />
  );
}
