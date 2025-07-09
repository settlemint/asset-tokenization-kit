import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";
import { createAction, getOrCreateActionExecutor } from "../../../actions/action-utils";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.deployedInTransaction = event.transaction.hash;
  xvpSettlement.save();

  // Create ApproveXvPSettlement actions for all approvers
  const approvers: Bytes[] = [];
  
  // Get flows to determine approvers
  const endpoint = xvpSettlement.id;
  const flows = xvpSettlement.flows.load();
  
  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    let approverExists = false;
    
    for (let j = 0; j < approvers.length; j++) {
      if (approvers[j].equals(flow.from)) {
        approverExists = true;
        break;
      }
    }
    
    if (!approverExists) {
      approvers.push(flow.from);
    }
  }

  // Create action executor for this settlement
  const actionExecutor = getOrCreateActionExecutor(
    event.params.settlement,
    approvers
  );

  // Create approval action for each approver
  for (let i = 0; i < approvers.length; i++) {
    const actionId = event.params.settlement.concat(approvers[i]).concat(Bytes.fromUTF8("approve"));
    
    createAction(
      actionId,
      actionExecutor,
      "ApproveXvPSettlement",
      "User",
      event.block.timestamp,
      event.block.timestamp, // Active immediately
      xvpSettlement.cutoffDate, // Expires at cutoff date
      event.params.settlement
    );
  }
}
