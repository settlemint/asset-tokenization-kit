import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RecoveryCodesActionsProps {
  onCopyAll: () => void;
  onDownload: () => void;
}

export function RecoveryCodesActions({
  onCopyAll,
  onDownload,
}: RecoveryCodesActionsProps) {
  const { t } = useTranslation(["onboarding"]);
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        variant="outline"
        onClick={onCopyAll}
        className="gap-2 press-effect"
      >
        <Copy className="h-4 w-4" />
        {t("wallet-security.recovery-codes.copy-all")}
      </Button>
      <Button
        variant="outline"
        onClick={onDownload}
        className="gap-2 press-effect"
      >
        <Download className="h-4 w-4" />
        {t("wallet-security.recovery-codes.download")}
      </Button>
    </div>
  );
}
