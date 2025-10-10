import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useRecoveryCodes(recoveryCodes: string[]) {
  const { t } = useTranslation(["onboarding"]);
  const handleCopyAll = useCallback(() => {
    void navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success(
      t("onboarding:wallet-security.recovery-codes.copied-to-clipboard")
    );
  }, [recoveryCodes, t]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([recoveryCodes.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(t("onboarding:wallet-security.recovery-codes.downloaded"));
  }, [recoveryCodes, t]);

  return {
    handleCopyAll,
    handleDownload,
  };
}
