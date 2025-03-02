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
        return "bg-sm-blue";
      case "cryptocurrency":
        return "bg-sm-teal";
      case "equity":
        return "bg-sm-orange";
      case "fund":
        return "bg-sm-green";
      case "stablecoin":
        return "bg-sm-purple";
      default:
        return "bg-sm-cyan";
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
