import { FormStep } from "@/components/blocks/form/form-step";
import type { SetupWalletSecurityInput } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";

export function SecurityCodes() {
  const t = useTranslations("private.auth.wallet-security.form.security-codes");

  return (
    <FormStep title={t("title")} description={t("description")}></FormStep>
  );
}

SecurityCodes.validatedFields = [] as (keyof SetupWalletSecurityInput)[];
