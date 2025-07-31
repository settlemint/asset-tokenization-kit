import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export function RecoveryCodesWarning() {
  const { t } = useTranslation(["onboarding"]);
  return (
    <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-sm-state-warning">
            {t("wallet-security.recovery-codes.warning")}
          </p>
        </div>
      </div>
    </div>
  );
}
