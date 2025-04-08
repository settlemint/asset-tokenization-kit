import { FormStep } from "@/components/blocks/form/form-step";
import type { SetupWalletSecurityInput } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { SecretCodesForm } from "../../secret-codes/secret-codes-form";

export function SecretCodes() {
  const t = useTranslations("private.auth.wallet-security.form.secret-codes");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <SecretCodesForm />
    </FormStep>
  );
}

SecretCodes.validatedFields = [] as (keyof SetupWalletSecurityInput)[];
