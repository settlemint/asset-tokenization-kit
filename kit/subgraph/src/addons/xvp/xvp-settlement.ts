import {
  XvPSettlementApprovalRevoked,
  XvPSettlementApproved,
  XvPSettlementCancelled,
  XvPSettlementExecuted,
} from "../../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchEvent } from "../../event/fetch/event";
import {
  fetchXvPSettlement,
  fetchXvPSettlementApproval,
} from "./fetch/xvp-settlement";

export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  fetchEvent(event, "XvPSettlementApproved");

  const approval = fetchXvPSettlementApproval(
    event.address,
    event.params.sender
  );
  approval.approved = true;
  approval.timestamp = event.block.timestamp;
  approval.save();

  const xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.save();
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  fetchEvent(event, "XvPSettlementApprovalRevoked");

  const approval = fetchXvPSettlementApproval(
    event.address,
    event.params.sender
  );
  approval.approved = false;
  approval.timestamp = event.block.timestamp;
  approval.save();

  const xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.save();
}

export function handleXvPSettlementExecuted(
  event: XvPSettlementExecuted
): void {
  fetchEvent(event, "XvPSettlementExecuted");

  let xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.executed = true;
  xvpSettlement.save();
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  fetchEvent(event, "XvPSettlementCancelled");

  let xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
