"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";

export type StatusType = "success" | "warning" | "error";

interface StatusPillProps {
  status: StatusType;
  label?: ReactNode;
  className?: string;
}

export function StatusPill({ status, label, className = "" }: StatusPillProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-success",
          background: "bg-success/80",
          foreground: "text-success-foreground",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          background: "bg-warning/80",
          foreground: "text-warning-foreground",
        };
      case "error":
        return {
          icon: AlertTriangle,
          color: "text-destructive",
          background: "bg-destructive/80",
          foreground: "text-destructive-foreground",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (!label) {
    // If no label, just show the icon with color
    return <Icon className={`size-3 ${config.color} ${className}`} />;
  }

  // Show badge with icon and label
  return (
    <Badge className={`${config.background} ${config.foreground} ${className}`}>
      <span className="flex items-center gap-1">
        <Icon className="size-3" />
        {label}
      </span>
    </Badge>
  );
}
