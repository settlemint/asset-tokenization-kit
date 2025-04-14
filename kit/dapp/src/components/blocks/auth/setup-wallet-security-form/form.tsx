import { Form } from "@/components/blocks/form/form";
import { setupWalletSecurity } from "@/lib/mutations/user/wallet/setup-wallet-security-action";
import { SetupWalletSecuritySchema } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { SecretCodes } from "./steps/secret-codes";
import { SelectMethod } from "./steps/select-method";
import { SetupVerification } from "./steps/setup-verification";
import { Summary } from "./steps/summary";

interface SetupWalletSecurityFormProps {
  onSetupComplete: () => void;
}

export function SetupWalletSecurityForm({
  onSetupComplete,
}: SetupWalletSecurityFormProps) {
  const t = useTranslations("private.auth.wallet-security.form");

  return (
    <Form
      action={setupWalletSecurity}
      resolver={typeboxResolver(SetupWalletSecuritySchema())}
      buttonLabels={{
        label: t("button-label"),
        submittingLabel: t("submitting-label"),
        processingLabel: t("processing-label"),
      }}
      hideButtons={(step) => step === 0}
      secureForm={false}
      onAnyFieldChange={(
        { getValues },
        { step, goToStep, changedFieldName }
      ) => {
        if (
          step === 0 &&
          changedFieldName === "verificationType" &&
          !!getValues("verificationType")
        ) {
          goToStep(1);
        }
      }}
      onOpenChange={(open) => {
        if (!open) {
          onSetupComplete();
        }
      }}
      defaultValues={{
        secretCodes: [],
      }}
      disablePreviousButton
    >
      <SelectMethod key="select-method" />
      <SetupVerification key="setup-verification" />
      <SecretCodes key="security-codes" />
      <Summary key="summary" />
    </Form>
  );
}
