import type { ActionName } from "@/lib/queries/actions/actions-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { getAddress } from "viem";
import { MatureForm } from "../bonds/mature-form/form";
import { ApproveForm } from "../xvp/approve-form/form";
import { ExecuteForm } from "../xvp/execute-form/form";

interface ActionButtonProps {
  actionName: ActionName;
  target: string;
}

export function ActionButton({ actionName, target }: ActionButtonProps) {
  switch (actionName) {
    case "ApproveXvPSettlement":
      return <ApproveForm xvp={getAddress(target)} asButton />;

    case "ExecuteXvPSettlement":
      return <ExecuteForm xvp={getAddress(target)} asButton />;

    case "MatureBond":
      return <MatureForm address={getAddress(target)} asButton />;
    default:
      exhaustiveGuard(actionName);
  }
}
