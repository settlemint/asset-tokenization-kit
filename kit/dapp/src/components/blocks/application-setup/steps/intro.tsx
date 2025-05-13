"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { applicationSetup } from "@/lib/mutations/application-setup/application-setup-action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("admin.application-setup");

  const onDeployContracts = async () => {
    try {
      setIsLoading(true);
      const result = await applicationSetup();
      if (result && "started" in result && result.started) {
        onNext();
      } else {
        toast.error(
          t("intro.start-failed", {
            error: "Unknown error",
          })
        );
      }
    } catch (error) {
      toast.error(
        t("intro.start-failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepContent
      onNext={onDeployContracts}
      centerContent={true}
      isNextDisabled={isLoading}
    >
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
