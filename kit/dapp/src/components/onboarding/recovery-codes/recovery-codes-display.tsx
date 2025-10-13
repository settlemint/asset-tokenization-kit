import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RecoveryCodeItem } from "./recovery-code-item";

interface RecoveryCodesDisplayProps {
  isGenerating: boolean;
  recoveryCodes: string[];
}

export function RecoveryCodesDisplay({
  isGenerating,
  recoveryCodes,
}: RecoveryCodesDisplayProps) {
  const { t } = useTranslation(["onboarding"]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t("onboarding:wallet-security.recovery-codes.generating")}
        </p>
      </div>
    );
  }

  if (recoveryCodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t("onboarding:wallet-security.recovery-codes.generated-error")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg p-6">
      <h4 className="text-sm font-medium mb-4 text-center">
        {t("onboarding:wallet-security.recovery-codes.your-recovery-codes", {
          count: recoveryCodes.length,
        })}
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recoveryCodes.map((code, index) => (
          <RecoveryCodeItem
            key={`${code}-${String(index)}`}
            code={code}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
