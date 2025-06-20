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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Icon className="size-5" />
          <div>{title}</div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
