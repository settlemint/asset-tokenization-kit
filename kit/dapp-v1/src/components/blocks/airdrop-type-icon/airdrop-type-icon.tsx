"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { useTranslations } from "next-intl";
import { getAirdropColor } from "./airdrop-color";

interface AirdropTypeIconProps {
  type: AirdropType;
  size?: "sm" | "md";
}

export function AirdropTypeIcon({ type, size = "sm" }: AirdropTypeIconProps) {
  const t = useTranslations("components.airdrop-type-icon");
  const sizeClass = size === "sm" ? "size-4" : "size-6";

  function getAirdropInitials(type: AirdropType): string {
    switch (type) {
      case "standard":
        return t("standard-initials");
      case "vesting":
        return t("vesting-initials");
      case "push":
        return t("push-initials");
      default:
        return t("not-available-initials");
    }
  }

  return (
    <Avatar className={`${sizeClass} border border-foreground-muted`}>
      <AvatarFallback
        className={cn(
          "font-bold text-[7px] text-foreground dark:text-sm-dark-gray",
          getAirdropColor(type)
        )}
      >
        {getAirdropInitials(type)}
      </AvatarFallback>
    </Avatar>
  );
}
