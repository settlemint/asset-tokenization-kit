"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface AssetTypeIconProps {
  type: "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin";
  size?: "sm" | "md";
}

export function AssetTypeIcon({ type, size = "sm" }: AssetTypeIconProps) {
  const t = useTranslations("components.asset-type-icon");
  const sizeClass = size === "sm" ? "size-5" : "size-6";

  function getAssetInitials(
    type: "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin"
  ): string {
    switch (type) {
      case "bond":
        return t("bond-initials");
      case "cryptocurrency":
        return t("cryptocurrency-initials");
      case "equity":
        return t("equity-initials");
      case "fund":
        return t("fund-initials");
      case "stablecoin":
        return t("stablecoin-initials");
      default:
        return t("not-available-initials");
    }
  }

  function getAssetColorClass(
    type: "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin"
  ): string {
    switch (type) {
      case "bond":
        return "bg-chart-1";
      case "cryptocurrency":
        return "bg-chart-2";
      case "equity":
        return "bg-chart-3";
      case "fund":
        return "bg-chart-4";
      case "stablecoin":
        return "bg-chart-5";
      default:
        return "bg-chart-5";
    }
  }

  return (
    <Avatar className={`${sizeClass} border border-foreground-muted`}>
      <AvatarFallback
        className={cn(
          "text-[7px] text-white dark:text-sm-dark-gray font-bold",
          getAssetColorClass(type)
        )}
      >
        {getAssetInitials(type)}
      </AvatarFallback>
    </Avatar>
  );
}
