import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useCallback } from "react";

interface RecoveryCodeItemProps {
  code: string;
  index: number;
  onCopy: (code: string, index: number) => void;
}

export function RecoveryCodeItem({
  code,
  index,
  onCopy,
}: RecoveryCodeItemProps) {
  const handleCopy = useCallback(() => {
    onCopy(code, index);
  }, [code, index, onCopy]);

  return (
    <div className="relative group">
      <div className="flex items-center p-2 bg-muted rounded-lg border hover:bg-muted/80 transition-colors">
        <span className="text-xs text-muted-foreground w-8">
          {(index + 1).toString().padStart(2, "0")}.
        </span>
        <code className="font-mono text-sm select-all flex-1 text-center">
          {code}
        </code>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleCopy}
        title={`Copy code ${index + 1}`}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}
