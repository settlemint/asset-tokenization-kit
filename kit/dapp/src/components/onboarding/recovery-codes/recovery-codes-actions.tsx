import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface RecoveryCodesActionsProps {
  onCopyAll: () => void;
  onDownload: () => void;
}

export function RecoveryCodesActions({
  onCopyAll,
  onDownload,
}: RecoveryCodesActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button variant="outline" onClick={onCopyAll} className="gap-2">
        <Copy className="h-4 w-4" />
        Copy codes
      </Button>
      <Button variant="outline" onClick={onDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download codes
      </Button>
    </div>
  );
}
