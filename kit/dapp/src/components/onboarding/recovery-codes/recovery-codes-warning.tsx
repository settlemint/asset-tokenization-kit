import { WarningAlert } from "@/components/ui/warning-alert";
import { useTranslation } from "react-i18next";

export function RecoveryCodesWarning() {
  const { t } = useTranslation(["onboarding"]);
  return (
    <WarningAlert description={t("wallet-security.recovery-codes.warning")} />
  );
}
