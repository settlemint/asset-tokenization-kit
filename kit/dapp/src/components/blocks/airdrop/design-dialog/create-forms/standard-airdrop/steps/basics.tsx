"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface AirdropBasicsProps {
  onNextStep: () => void;
}

export function Basics({ onNextStep }: AirdropBasicsProps) {
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
      <div className="mt-8 flex justify-end">
        <Button onClick={onNextStep}>{t("components.form.button.next")}</Button>
      </div>
    </StepContent>
  );
}
