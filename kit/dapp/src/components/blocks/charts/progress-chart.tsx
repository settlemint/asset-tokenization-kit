"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReactNode } from "react";

interface ProgressChartProps {
  title: string;
  description?: string;
  value: number;
  max: number;
  footer?: ReactNode;
}

export function ProgressChart({
  title,
  description,
  value,
  max,
  footer,
}: ProgressChartProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-36 h-36">
            <Progress
              value={percentage}
              className="w-36 h-36 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {value.toLocaleString()} / {max.toLocaleString()}
          </div>
        </div>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}