import {
  XvPSettlementApprovalRevokedEvent,
  XvPSettlementApprovedEvent,
  XvPSettlementCancelledEvent,
  XvPSettlementExecutedEvent,
} from "../../generated/schema";
import {
  XvPSettlementApprovalRevoked,
  XvPSettlementApproved,
  XvPSettlementCancelled,
  XvPSettlementClaimed,
} from "../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAccount } from "../fetch/account";
import { fetchApproval, fetchXvPSettlement } from "../fetch/xvp-settlement";
import { eventId } from "../utils/events";

// Handle DvPSwap-specific events

export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementApprovedEvent = new XvPSettlementApprovedEvent(
    eventId(event)
  );
  xvpSettlementApprovedEvent.xvpSettlement = xvpSettlement.id;
  xvpSettlementApprovedEvent.sender = sender.id;
  xvpSettlementApprovedEvent.save();
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementApprovalRevokedEvent =
    new XvPSettlementApprovalRevokedEvent(eventId(event));
  xvpSettlementApprovalRevokedEvent.xvpSettlement = xvpSettlement.id;
  xvpSettlementApprovalRevokedEvent.sender = sender.id;
  xvpSettlementApprovalRevokedEvent.save();

  const approval = fetchApproval(event.address, event.transaction.from);
  approval.save();
}

export function handleXvPSettlementClaimed(event: XvPSettlementClaimed): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementExecutedEvent = new XvPSettlementExecutedEvent(
    eventId(event)
  );
  xvpSettlementExecutedEvent.xvpSettlement = xvpSettlement.id;
  xvpSettlementExecutedEvent.sender = sender.id;
  xvpSettlementExecutedEvent.save();

  xvpSettlement.claimed = true;
  xvpSettlement.save();
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementCancelledEvent = new XvPSettlementCancelledEvent(
    eventId(event)
  );
  xvpSettlementCancelledEvent.xvpSettlement = xvpSettlement.id;
  xvpSettlementCancelledEvent.sender = sender.id;
  xvpSettlementCancelledEvent.save();

  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
