import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import { fetchEvent } from "../../../event/fetch/event";
import {
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../../utils/actions";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.deployedInTransaction = event.transaction.hash;
  xvpSettlement.save();

  const approvals = xvpSettlement.approvals.load();
  for (let i = 0; i < approvals.length; i++) {
    const approval = approvals[i];
    createAction(
      event,
      ActionName.ApproveXvPSettlement,
      event.params.settlement,
      event.block.timestamp,
      xvpSettlement.cutoffDate,
      [approval.account],
      null,
      createActionIdentifier(
        ActionName.ApproveXvPSettlement,
        event.params.settlement,
        approval.account
      )
    );
  }
}
