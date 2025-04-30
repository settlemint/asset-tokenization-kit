import { XvPSettlement } from "../../generated/templates";
import { XvPSettlementCreated } from "../../generated/XvPSettlementFactory/XvPSettlementFactory";
import { fetchAccount } from "../fetch/account";
import { fetchXvPSettlement } from "../fetch/xvp-settlement";

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

  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.save();

  XvPSettlement.create(event.params.settlement);
}
