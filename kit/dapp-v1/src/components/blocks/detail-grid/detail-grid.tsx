import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export type DetailGridProps = ComponentPropsWithoutRef<typeof Card>;

export function DetailGrid({
  children,
  className,
  title,
  ...props
}: DetailGridProps) {
  return (
    <div className={cn("mt-4 flex flex-col gap-4", className)}>
      {title && <div className="font-medium text-accent text-xl">{title}</div>}
      <Card {...props}>
        <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
