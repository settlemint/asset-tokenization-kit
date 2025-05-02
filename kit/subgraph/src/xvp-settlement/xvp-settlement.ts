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
import { EventName } from "../utils/enums";
import { eventId } from "../utils/events";

export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementApprovedEvent = new XvPSettlementApprovedEvent(
    eventId(event)
  );
  xvpSettlementApprovedEvent.emitter = event.address;
  xvpSettlementApprovedEvent.sender = sender.id;
  xvpSettlementApprovedEvent.timestamp = event.block.timestamp;
  xvpSettlementApprovedEvent.eventName = EventName.XvPSettlementApproved;

  xvpSettlementApprovedEvent.save();
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  const sender = fetchAccount(event.transaction.from);
  const xvpSettlementApprovalRevokedEvent =
    new XvPSettlementApprovalRevokedEvent(eventId(event));
  xvpSettlementApprovalRevokedEvent.emitter = event.address;
  xvpSettlementApprovalRevokedEvent.sender = sender.id;
  xvpSettlementApprovalRevokedEvent.timestamp = event.block.timestamp;
  xvpSettlementApprovalRevokedEvent.eventName =
    EventName.XvPSettlementApprovalRevoked;

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
  xvpSettlementExecutedEvent.sender = sender.id;
  xvpSettlementExecutedEvent.save();
  xvpSettlementExecutedEvent.eventName = EventName.XvPSettlementClaimed;
  xvpSettlementExecutedEvent.timestamp = event.block.timestamp;
  xvpSettlementExecutedEvent.emitter = event.address;

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
  xvpSettlementCancelledEvent.sender = sender.id;
  xvpSettlementCancelledEvent.save();
  xvpSettlementCancelledEvent.eventName = EventName.XvPSettlementCancelled;
  xvpSettlementCancelledEvent.timestamp = event.block.timestamp;
  xvpSettlementCancelledEvent.emitter = event.address;

  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
