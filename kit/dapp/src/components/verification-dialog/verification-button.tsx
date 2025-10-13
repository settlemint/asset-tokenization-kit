import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { ComponentProps } from "react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export function VerificationButton({
  children,
  disabled,
  walletVerification,
  onSubmit,
  buttonProps,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  walletVerification: {
    title: string;
    description: string;
  };
  onSubmit: (verification: UserVerification) => void | Promise<void>;
  buttonProps?: Omit<
    ComponentProps<typeof Button>,
    "onClick" | "children" | "type"
  >;
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

  const triggerDisabled = disabled ?? buttonProps?.disabled ?? false;

  return (
    <>
      <Button
        type="button"
        {...buttonProps}
        onClick={() => {
          setShowVerificationModal(true);
        }}
        disabled={triggerDisabled}
      >
        {children}
      </Button>

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleSubmit}
        title={walletVerification.title}
        description={walletVerification.description}
        errorMessage={verificationError}
      />
    </>
  );
}
