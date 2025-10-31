import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ContentTabItem {
  value: string;
  label: ReactNode;
  description?: string;
}

interface ContentTabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root> {
  items: ContentTabItem[];
  children: ReactNode;
}

export function ContentTabs({
  items,
  children,
  className,
  ...props
}: ContentTabsProps) {
  return (
    <TabsPrimitive.Root className={cn("space-y-6", className)} {...props}>
      <div className="overflow-x-auto">
        <TabsPrimitive.List className="flex w-full justify-start border-b">
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              title={item.description}
              className={cn(
                "group/tab relative inline-flex h-10 items-center px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
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

export function ContentTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content className={cn("space-y-4", className)} {...props} />
  );
}
