import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";
import { fetchAccount } from "../../../account/fetch/account";
import { createAction, ActionName, ActionType } from "../../../utils/actions";

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
      fetchAccount(event.params.settlement).id,
      ActionType.User,
      event.block.timestamp,
      xvpSettlement.cutoffDate,
      [approval.account],
      null,
      approval.account.toHexString()
    );
  }
}
