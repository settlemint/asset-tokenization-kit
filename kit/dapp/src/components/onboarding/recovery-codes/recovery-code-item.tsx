import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { cn } from "@/lib/utils";

interface RecoveryCodeItemProps {
  code: string;
  index: number;
  className?: string;
}

export function RecoveryCodeItem({
  code,
  index,
  className,
}: RecoveryCodeItemProps) {
  return (
    <div className="group">
      <CopyToClipboard
        value={code}
        className={cn("inline-flex items-center", className)}
      >
        <span className="text-xs text-muted-foreground w-8">
          {(index + 1).toString().padStart(2, "0")}.
        </span>
        <code className="font-mono text-sm select-all flex-1 text-center">
          {code}
        </code>
      </CopyToClipboard>
    </div>
  );
}
