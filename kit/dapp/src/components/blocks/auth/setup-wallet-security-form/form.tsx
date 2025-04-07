import { Form } from "@/components/blocks/form/form";
import { setupWalletSecurity } from "@/lib/mutations/user/wallet/setup-wallet-security-action";
import { SetupWalletSecuritySchema } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { SecretCodes } from "./steps/secret-codes";
import { SelectMethod } from "./steps/select-method";
import { SetupVerification } from "./steps/setup-verification";
import { Summary } from "./steps/summary";

export function SetupWalletSecurityForm() {
  const t = useTranslations("private.auth.wallet-security.form");

  return (
    <Form
      action={setupWalletSecurity}
      resolver={typeboxResolver(SetupWalletSecuritySchema())}
      buttonLabels={{
        label: t("button-label"),
      }}
      hideButtons={(step) => step === 0}
      secureForm={false}
    >
      {({ goToNextStep }) => [
        <SelectMethod key="select-method" goToNextStep={goToNextStep} />,
        <SetupVerification key="setup-verification" />,
        <SecretCodes key="security-codes" />,
        <Summary key="summary" />,
      ]}
    </Form>
  );
}
