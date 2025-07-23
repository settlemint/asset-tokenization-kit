import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function RecoveryCodesWarning() {
  const { t } = useTranslation(["onboarding"]);
  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
            {t("wallet-security.recovery-codes.warning")}
          </p>
        </div>
      </div>
    </div>
  );
}
