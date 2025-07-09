import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface DataTableEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Empty state component for data tables
 * Can be used when there's no data to display in a table
 */
export function DataTableEmptyState({
  icon: Icon,
  title,
  description,
}: DataTableEmptyStateProps) {
  return (
    <div className="py-8 px-6 text-center">
      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
        <Icon className="size-4" />
        <p className="font-medium text-sm">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
