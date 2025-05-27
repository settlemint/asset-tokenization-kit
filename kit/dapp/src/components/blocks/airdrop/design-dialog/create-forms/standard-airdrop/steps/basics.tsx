"use client";

import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { useTranslations } from "next-intl";

export function Basics() {
  const t = useTranslations("private.airdrops.create.basics");

  return (
    <StepContent>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground pt-2">{t("description")}</p>
      </div>
      <div>
        <p>Airdrop Basics - Placeholder Content</p>
      </div>
    </StepContent>
  );
}
