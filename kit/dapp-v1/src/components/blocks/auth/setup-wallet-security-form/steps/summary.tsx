import { FormStep } from "@/components/blocks/form/form-step";
import type { SetupWalletSecurityInput } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";

export function Summary() {
  const t = useTranslations("private.auth.wallet-security.form.summary");

  return <FormStep title={t("title")} description={t("description")} />;
}

Summary.validatedFields = [] as (keyof SetupWalletSecurityInput)[];
