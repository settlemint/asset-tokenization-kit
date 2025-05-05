import { XvPSettlement } from "../../generated/templates";
import { XvPSettlementCreated } from "../../generated/XvPSettlementFactory/XvPSettlementFactory";
import { fetchXvPSettlement } from "../trading/fetch/xvp-settlement";
import { fetchAccount } from "../utils/account";
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
}
