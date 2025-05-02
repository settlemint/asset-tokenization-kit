import { XvPSettlement } from "../../generated/templates";
import { XvPSettlementCreated } from "../../generated/XvPSettlementFactory/XvPSettlementFactory";
import { xvpSettlementCreatedEvent } from "../assets/events/xvpsettlementcreated";
import { fetchAccount } from "../fetch/account";
import { fetchXvPSettlement } from "../fetch/xvp-settlement";
import { eventId } from "../utils/events";

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

  xvpSettlementCreatedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    event.transaction.from
  );

  XvPSettlement.create(event.params.settlement);

  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.save();
}
