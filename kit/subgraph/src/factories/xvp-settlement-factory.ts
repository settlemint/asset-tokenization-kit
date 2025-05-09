import { XvPSettlement } from "../../generated/templates";
import { XvPSettlementCreated } from "../../generated/XvPSettlementFactory/XvPSettlementFactory";
import { fetchXvPSettlement } from "../trading/fetch/xvp-settlement";
import { fetchAccount } from "../utils/account";
import { ActionName, createAction } from "../utils/action";
import { ActionAuthorizationMethod, ActionType } from "../utils/enums";
/**
 * Handles XvPSettlementCreated events from the XvPSettlementFactory contract.
 * Ensures the factory and creator are registered as Accounts,
 * creates the XvPSettlement entity, updates counts, logs events,
 * and starts indexing the new XvPSettlement contract via template.
 * @param event The XvPSettlementCreated event
 */
export function handleXvPSettlementCreated(event: XvPSettlementCreated): void {
  const factoryAccount = fetchAccount(event.address);
  factoryAccount.lastActivity = event.block.timestamp;
  factoryAccount.save();

  XvPSettlement.create(event.params.settlement);

  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.save();

  const approvals = xvpSettlement.approvals.load();
  for (let i = 0; i < approvals.length; i++) {
    const approval = approvals[i];
    createAction(
      event,
      ActionName.ApproveXvPSettlement,
      xvpSettlement.id,
      ActionType.User,
      event.block.timestamp,
      xvpSettlement.cutoffDate,
      ActionAuthorizationMethod.UserSpecific,
      [approval.account],
      null
    );
  }
}
