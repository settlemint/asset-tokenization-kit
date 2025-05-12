import {
  XvPSettlementApprovalRevoked,
  XvPSettlementApproved,
  XvPSettlementCancelled,
  XvPSettlementClaimed,
} from "../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAccount } from "../utils/account";
import {
  actionExecuted,
  ActionName,
  actionRevoked,
  createAction,
} from "../utils/action";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { ActionType } from "../utils/enums";
import { fetchApproval, fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  createActivityLogEntry(
    event,
    EventType.XvPSettlementApproved,
    event.params.sender,
    [event.params.sender]
  );
  const approval = fetchApproval(event.address, event.params.sender);
  approval.approved = true;
  approval.timestamp = event.block.timestamp;
  approval.save();

  const xvpSettlement = fetchXvPSettlement(event.address);
  actionExecuted(
    event,
    ActionName.ApproveXvPSettlement,
    fetchAccount(event.address).id,
    approval.account.toHexString()
  );

  if (xvpSettlement.autoExecute) {
    return;
  }

  const approvals = xvpSettlement.approvals.load();
  let allApproved = true;
  for (let i = 0; i < approvals.length; i++) {
    const approval = approvals[i];
    if (!approval.approved) {
      allApproved = false;
      break;
    }
  }

  if (allApproved) {
    createAction(
      event,
      ActionName.ClaimXvPSettlement,
      fetchAccount(event.address).id,
      ActionType.User,
      event.block.timestamp,
      xvpSettlement.cutoffDate,
      xvpSettlement.participants,
      null,
      null
    );
  }
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  createActivityLogEntry(
    event,
    EventType.XvPSettlementApprovalRevoked,
    event.params.sender,
    [event.params.sender]
  );
  const approval = fetchApproval(event.address, event.params.sender);
  approval.approved = false;
  approval.timestamp = event.block.timestamp;
  approval.save();

  const xvpSettlement = fetchXvPSettlement(event.address);
  actionRevoked(
    ActionName.ApproveXvPSettlement,
    fetchAccount(event.address).id,
    approval.account.toHexString()
  );
}

export function handleXvPSettlementClaimed(event: XvPSettlementClaimed): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(
    event,
    EventType.XvPSettlementClaimed,
    event.params.sender,
    [event.params.sender]
  );

  xvpSettlement.claimed = true;
  xvpSettlement.save();

  actionExecuted(
    event,
    ActionName.ClaimXvPSettlement,
    fetchAccount(event.address).id,
    null
  );
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(
    event,
    EventType.XvPSettlementCancelled,
    event.params.sender,
    [event.params.sender]
  );

  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
