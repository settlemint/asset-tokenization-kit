import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export function VerificationButton({
  children,
  disabled,
  verification,
  onSubmit,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  verification: {
    title: string;
    description: string;
  };
  onSubmit: (verification: UserVerification) => void | Promise<void>;
}) {
  const { t } = useTranslation(["common"]);

  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const handleSubmit = useCallback(
    async (verification: UserVerification) => {
      setVerificationError(null);
      try {
        await onSubmit(verification);
        setShowVerificationModal(false);
      } catch (error) {
        setVerificationError(
          error instanceof Error
            ? error.message
            : t("common:errors.somethingWentWrong")
        );
      }
    },
    [onSubmit, t]
  );

  return (
    <>
      <Button
        onClick={() => {
          setShowVerificationModal(true);
        }}
        disabled={disabled}
      >
        {children}
      </Button>

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleSubmit}
        title={verification.title}
        description={verification.description}
        errorMessage={verificationError}
      />
    </>
  );
}
