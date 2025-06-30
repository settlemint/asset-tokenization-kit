import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type RecoveryCodesDisplayProps = {
  codes: string[];
  className?: string;
  onDownload?: () => void;
};

/**
 * Component to display recovery codes in a secure and user-friendly format
 */
export function RecoveryCodesDisplay({
  codes,
  className,
  onDownload,
}: RecoveryCodesDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyCode = useCallback(async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success("Recovery code copied to clipboard");
    } catch {
      toast.error("Failed to copy recovery code");
    }
  }, []);

  const copyAllCodes = useCallback(async () => {
    try {
      const allCodes = codes.join("\n");
      await navigator.clipboard.writeText(allCodes);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
      toast.success("All recovery codes copied to clipboard");
    } catch {
      toast.error("Failed to copy recovery codes");
    }
  }, [codes]);

  const downloadCodes = useCallback(() => {
    const content = codes
      .map((code, index) => `${index + 1}. ${code}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recovery-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
    onDownload?.();
  }, [codes, onDownload]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Warning message */}
      <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Important: Save These Recovery Codes
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              These codes can be used to access your wallet if you forget your
              PIN code. Store them in a safe place and never share them with
              anyone.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={copyAllCodes}
          disabled={copiedAll}
          className="flex items-center gap-2"
        >
          {copiedAll ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
          {copiedAll ? "Copied All" : "Copy All"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadCodes}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Recovery codes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {codes.map((code, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-6">
              {index + 1}.
            </span>
            <code className="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
              {code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCode(code, index)}
              className="h-6 w-6 p-0 flex-shrink-0"
              disabled={copiedIndex === index}
            >
              {copiedIndex === index ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                <CopyIcon className="h-3 w-3" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Security reminder */}
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center space-y-1">
        <p>• Keep these codes in a secure location</p>
        <p>• Each code can only be used once</p>
        <p>• Generate new codes if these are compromised</p>
      </div>
    </div>
  );
}
