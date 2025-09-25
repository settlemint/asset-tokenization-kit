import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PieChart as PieChartIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChartUpdateInfo } from "./chart-update-info";

interface ChartEmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  footer?: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  interval?: "hour" | "day";
}

export function ChartEmptyState({
  title,
  description,
  className,
  footer,
  isLoading = false,
  emptyMessage,
  emptyDescription,
  interval,
}: ChartEmptyStateProps) {
  const { t } = useTranslation("stats");

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-48" />
            {interval && <ChartUpdateInfo interval={interval} />}
          </div>
          {description && <Skeleton className="h-4 w-64" />}
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
        {footer && (
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {interval && <ChartUpdateInfo interval={interval} />}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
          <PieChartIcon className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {emptyMessage ?? t("charts.common.noData")}
            </p>
            {(emptyDescription ?? t("charts.common.noDataDescription")) && (
              <p className="text-xs text-muted-foreground">
                {emptyDescription ?? t("charts.common.noDataDescription")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
