import { Button } from "@/components/ui/button";
import type { ActionName } from "@/lib/queries/actions/actions-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { getAddress } from "viem";
import { MatureForm } from "../bonds/mature-form/form";

interface ActionButtonProps {
  actionName: ActionName;
  target: string;
}

export function ActionButton({ actionName, target }: ActionButtonProps) {
  switch (actionName) {
    case "ApproveXvPSettlement":
      return (
        <Button variant="outline" size="sm">
          Something
        </Button>
      );

    case "ClaimXvPSettlement":
      return (
        <Button variant="outline" size="sm">
          Something
        </Button>
      );

    case "MatureBond":
      return <MatureForm address={getAddress(target)} asButton />;
    default:
      exhaustiveGuard(actionName);
  }
}
