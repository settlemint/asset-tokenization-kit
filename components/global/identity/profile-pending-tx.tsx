import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BringToFront } from "lucide-react";

interface PendingTxProps {
  pendingCount?: number;
  onOpenSheet: () => void;
}

export function PendingTx({ pendingCount, onOpenSheet }: PendingTxProps) {
  return (
    <DropdownMenuItem
      aria-label="Pending transactions"
      onSelect={(event) => {
        event.preventDefault();
        onOpenSheet();
      }}
    >
      <BringToFront className="mr-2 h-4 w-4" />
      <span>Pending transactions</span>
      {(pendingCount ?? 0) > 0 && (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{pendingCount}</Badge>
      )}
    </DropdownMenuItem>
  );
}
