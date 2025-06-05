"use client";

import { StatusPill } from "@/components/blocks/status-pill/status-pill";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { isCompliant as isMicaCompliant } from "@/lib/utils/mica";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

interface MicaRegulationPillProps {
  config: MicaRegulationConfig;
}

export function MicaRegulationPill({
  config,
}: MicaRegulationPillProps): ReactElement {
  const t = useTranslations("regulations.mica");

  const isCompliant = isMicaCompliant(config);

  return (
    <StatusPill
      status={isCompliant ? "success" : "warning"}
      label={t("name")}
    />
  );
}
