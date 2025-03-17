"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { PropsWithChildren } from "react";

const containerVariants = cva("", {
  variants: {
    variant: {
      loading: "",
      noData: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "loading",
  },
});

export type ChartSkeletonVariants = VariantProps<typeof containerVariants>;

interface ChartSkeletonProps extends ChartSkeletonVariants, PropsWithChildren {
  title: string;
  description?: string;
}

export function ChartSkeleton({
  variant = "loading",
  children,
  title,
  description,
}: ChartSkeletonProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent
        className={cn(containerVariants({ variant }), "flex-1 gap-2")}
      >
        <div className="flex h-full flex-col items-center justify-center">
          {variant === "loading" ? <></> : children}
        </div>
      </CardContent>
    </Card>
  );
}
