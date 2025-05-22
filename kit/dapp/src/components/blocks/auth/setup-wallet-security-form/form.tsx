import { Form } from "@/components/blocks/form/form";
import { authClient } from "@/lib/auth/client";
import { setupWalletSecurity } from "@/lib/mutations/user/wallet/setup-wallet-security-action";
import {
  SetupWalletSecuritySchema,
  type SetupWalletSecurityInput,
} from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { cn } from "@/lib/utils";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { Path, UseFormReturn } from "react-hook-form";
import { SecretCodes } from "./steps/secret-codes";
import { SelectMethod } from "./steps/select-method";
import { SetupVerification } from "./steps/setup-verification";
import { Summary } from "./steps/summary";

const WalletSecuritySchemaObject = SetupWalletSecuritySchema();

export function SetupWalletSecurityForm() {
  const t = useTranslations("private.auth.wallet-security.form");
  const { refetch, isPending } = authClient.useSession();

  const handleAnyFieldChange = useCallback(
    (
      form: UseFormReturn<SetupWalletSecurityInput>,
      {
        step,
        goToStep,
        changedFieldName,
      }: {
        step: number;
        goToStep: (step: number) => void;
        changedFieldName: Path<SetupWalletSecurityInput> | undefined;
      }
    ) => {
      const currentVerificationTypeValue = form.getValues("verificationType");
      if (
        step === 0 &&
        changedFieldName === "verificationType" &&
        currentVerificationTypeValue === "pincode"
      ) {
        goToStep(1);
      }
    },
    []
  );

  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        isPending ? "pointer-events-none opacity-50" : "opacity-100"
      )}
    >
      <Form<
        string, // ServerError
        typeof WalletSecuritySchemaObject, // S (Schema)
        readonly [], // BAS (BeforeActionSchemas)
        any, // CVE (CustomValidationErrors)
        any, // CBAVE (CustomBeforeActionValidationErrors)
        any // Data (Action return type)
      >
        action={setupWalletSecurity}
        resolver={typeboxResolver(WalletSecuritySchemaObject)}
        buttonLabels={{
          label: t("button-label"),
          submittingLabel: t("submitting-label"),
          processingLabel: t("processing-label"),
        }}
        hideButtons={(step) => step === 0}
        secureForm={false}
        onAnyFieldChange={handleAnyFieldChange}
        defaultValues={{
          secretCodes: [],
          verificationType: undefined,
        }}
        onOpenChange={(open) => {
          if (!open) {
            refetch();
          }
        }}
        onSuccess={() => {
          refetch();
        }}
        toast={{
          disabled: true,
        }}
        disablePreviousButton
      >
        <SelectMethod key="select-method" />
        <SetupVerification key="setup-verification" />
        <SecretCodes key="security-codes" />
        <Summary key="summary" />
      </Form>
    </div>
  );
}
