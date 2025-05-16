"use client";

import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { applicationSetup } from "@/lib/mutations/application-setup/application-setup-action";
import type { VerificationType } from "@/lib/utils/typebox/verification-type";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const t = useTranslations("admin.application-setup");
  // Verification form
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

  const handleVerificationSubmit = async () => {
    try {
      setIsLoading(true);
      const result = await applicationSetup({
        verificationCode: verificationForm.getValues("verificationCode"),
        verificationType: verificationForm.getValues(
          "verificationType"
        ) as VerificationType,
      });
      if (result?.data && "started" in result.data && result.data.started) {
        setShowVerificationDialog(false);
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

  const handleVerificationCancel = () => {
    setShowVerificationDialog(false);
    verificationForm.reset();
  };

  return (
    <>
      <FormProvider {...verificationForm}>
        <FormOtpDialog
          name="verificationCode"
          open={showVerificationDialog}
          onOpenChange={(open: boolean) => {
            if (!open) {
              handleVerificationCancel();
            } else {
              setShowVerificationDialog(open);
            }
          }}
          onSubmit={handleVerificationSubmit}
          control={verificationForm.control}
        />
      </FormProvider>
      <StepContent
        onNext={() => {
          setShowVerificationDialog(true);
        }}
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
    </>
  );
}
