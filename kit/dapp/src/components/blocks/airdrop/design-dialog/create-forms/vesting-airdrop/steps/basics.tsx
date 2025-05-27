"use client";

import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { useTranslations } from "next-intl";

export function Basics() {
  const t = useTranslations();

  return (
    <StepContent>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("private.airdrops.create.basics.title")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {t("private.airdrops.create.basics.description")}
        </p>
      </div>
      <div>
        <p>Airdrop Basics - Placeholder Content</p>
      </div>
    </StepContent>
  );
}
