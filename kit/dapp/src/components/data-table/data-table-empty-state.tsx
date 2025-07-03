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
    <Card className="animate-in fade-in-0 zoom-in-95 duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Icon className="size-5 animate-in spin-in-90 duration-500" />
          <div className="animate-in slide-in-from-left-2 duration-500">
            {title}
          </div>
        </CardTitle>
        <CardDescription className="animate-in fade-in-50 slide-in-from-bottom-1 duration-500 delay-200">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
