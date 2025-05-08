"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { useTranslations } from "next-intl";

interface BootstrapStepProps {
  onNext: () => void;
}

export function BootstrapStep({ onNext }: BootstrapStepProps) {
  const t = useTranslations("admin.application-setup");

  return (
    <StepContent onNext={onNext} centerContent={true} isNextDisabled={true}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("bootstrap.title")}</h2>
        </div>
      </div>
    </StepContent>
  );
}
