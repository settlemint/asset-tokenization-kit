"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { useTranslations } from "next-intl";

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  const t = useTranslations("admin.application-setup");

  return (
    <StepContent onNext={onNext} centerContent={true}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("intro.title")}</h2>
          <p className="text-muted-foreground pt-2 whitespace-pre-wrap">
            {t("intro.description")}
          </p>
        </div>
      </div>
    </StepContent>
  );
}
