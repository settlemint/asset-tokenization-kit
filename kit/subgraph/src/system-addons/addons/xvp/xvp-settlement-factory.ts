import { Bytes, log } from "@graphprotocol/graph-ts";
import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import {
  createAction,
  getOrCreateActionExecutor,
} from "../../../actions/action-utils";
import {
  ACTION_TYPE_APPROVE_XVP_SETTLEMENT,
  ACTION_USER_TYPE_USER,
} from "../../../constants/action-types";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.deployedInTransaction = event.transaction.hash;
  xvpSettlement.save();

  // Create ApproveXvPSettlement actions for all approvers
  // Use array with indexOf for O(n) uniqueness checking instead of O(n²) nested loops
  const approverStrings: string[] = [];

  // Get flows to determine approvers
  const flows = xvpSettlement.flows.load();

  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    const approverString = flow.from.toHexString();

    // Use indexOf for faster lookup than nested loop
    if (approverStrings.indexOf(approverString) === -1) {
      approverStrings.push(approverString);
    }
  }

  // Convert string array back to Bytes array
  const approvers: Bytes[] = [];
  for (let i = 0; i < approverStrings.length; i++) {
    approvers.push(Bytes.fromHexString(approverStrings[i]));
  }

  // Create action executor for this settlement
  const actionExecutor = getOrCreateActionExecutor(
    event.params.settlement,
    approvers
  );

  // Create approval action for each approver
  for (let i = 0; i < approvers.length; i++) {
    const actionId = event.params.settlement
      .concat(approvers[i])
      .concat(Bytes.fromUTF8("approve"));

    const action = createAction(
      actionId,
      actionExecutor,
      ACTION_TYPE_APPROVE_XVP_SETTLEMENT,
      ACTION_USER_TYPE_USER,
      event.block.timestamp,
      event.block.timestamp, // Active immediately
      xvpSettlement.cutoffDate, // Expires at cutoff date
      event.params.settlement
    );

    if (!action) {
      log.warning("Failed to create approval action for approver: {}", [
        approvers[i].toHexString(),
      ]);
    }
  }
}
