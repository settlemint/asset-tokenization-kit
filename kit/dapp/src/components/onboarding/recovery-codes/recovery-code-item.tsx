import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";

interface RecoveryCodeItemProps {
  code: string;
  index: number;
}

export function RecoveryCodeItem({ code, index }: RecoveryCodeItemProps) {
  return (
    <div className="group">
      <CopyToClipboard
        value={code}
        className="relative flex items-center p-2 bg-muted rounded-lg border hover:bg-muted/80 transition-colors [&_.inline-flex]:w-full [&_button]:absolute [&_button]:top-1 [&_button]:right-1 [&_button]:opacity-0 [&_button]:group-hover:opacity-100 [&_button]:transition-opacity [&_button]:h-6 [&_button]:w-6 [&_button]:p-0"
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
