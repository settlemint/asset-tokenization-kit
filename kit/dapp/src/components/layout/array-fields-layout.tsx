import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface ArrayFieldsLayoutProps<T> {
  values: T[];
  onAdd: () => void;
  onRemove: (value: T, index: number) => void;
  component: (value: T, index: number) => ReactNode;
  rowKey?: (value: T, index: number) => React.Key;
  addButtonLabel?: string;
  className?: string;
}

export function ArrayFieldsLayout<T>({
  values,
  onAdd,
  onRemove,
  component,
  addButtonLabel,
  rowKey,
  className,
}: ArrayFieldsLayoutProps<T>) {
  const { t } = useTranslation("common");
  return (
    <div className={cn("space-y-3", className)}>
      {values.map((value, index) => (
        <div
          key={rowKey ? rowKey(value, index) : index}
          className="flex items-start gap-2"
        >
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
        {addButtonLabel || t("actions.add")}
      </Button>
    </div>
  );
}
