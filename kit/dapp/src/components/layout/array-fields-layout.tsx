import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";

export interface ArrayFieldsLayoutProps<T> {
  values: T[];
  onAdd: () => void;
  onRemove: (value: T, index: number) => void;
  component: (value: T, index: number) => ReactNode;
  addButtonLabel?: string;
  className?: string;
}

export function ArrayFieldsLayout<T>({
  values,
  onAdd,
  onRemove,
  component,
  addButtonLabel = "Add Item",
  className,
}: ArrayFieldsLayoutProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {values.map((value, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">{component(value, index)}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onRemove(value, index);
            }}
            type="button"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        type="button"
        className="flex items-center gap-2"
      >
        <Plus className="size-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
}
