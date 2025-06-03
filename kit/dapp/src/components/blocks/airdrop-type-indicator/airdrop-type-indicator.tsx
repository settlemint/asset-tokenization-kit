"use client";

import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { useTranslations } from "next-intl";
import { AirdropTypeIcon } from "../airdrop-type-icon/airdrop-type-icon";

interface AirdropTypeIndicatorProps {
  type: AirdropType;
}

export function AirdropTypeIndicator({ type }: AirdropTypeIndicatorProps) {
  const t = useTranslations("private.airdrops");

  return (
    <div className="flex items-center gap-2">
      <AirdropTypeIcon type={type} size="sm" />
      <span className="capitalize">{t(`type.${type}`)}</span>
    </div>
  );
}
