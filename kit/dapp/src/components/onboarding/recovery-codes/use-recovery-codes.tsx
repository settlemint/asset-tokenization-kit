import { useCallback } from "react";
import { toast } from "sonner";

export function useRecoveryCodes(recoveryCodes: string[]) {
  const handleCopyAll = useCallback(() => {
    void navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied to clipboard!");
  }, [recoveryCodes]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([recoveryCodes.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded!");
  }, [recoveryCodes]);

  return {
    handleCopyAll,
    handleDownload,
  };
}
