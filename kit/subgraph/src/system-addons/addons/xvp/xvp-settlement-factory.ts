import { Address, BigInt } from "@graphprotocol/graph-ts";
import { XvPSettlement as XvPSettlementContract } from "../../../../generated/templates/XvPSettlement/XvPSettlement";
import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import {
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../../actions/actions";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";
import { fetchXvPSettlementApproval, fetchXvPSettlementCancelVote } from "./xvp-settlement";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.deployedInTransaction = event.transaction.hash;
  xvpSettlement.save();

  // Manual approval lookup instead of using derived field .load()
  // Get flows from contract to extract approver addresses
  const settlementContract = XvPSettlementContract.bind(
    event.params.settlement
  );
  const flows = settlementContract.try_flows();

  if (!flows.reverted) {
    const approvers: Address[] = [];
    const localParticipants: Address[] = [];

    // Collect unique approvers (from addresses) from flows
    for (let i = 0; i < flows.value.length; i++) {
      const flow = flows.value[i];

      const isLocal = flow.externalChainId.equals(BigInt.zero());
      if (!isLocal) {
        continue;
      }

      let fromExists = false;
      for (let j = 0; j < approvers.length; j++) {
        if (approvers[j].equals(flow.from)) {
          fromExists = true;
          break;
        }
      }
      if (!fromExists) {
        approvers.push(flow.from);
      }

      let senderRegistered = false;
      for (let j = 0; j < localParticipants.length; j++) {
        if (localParticipants[j].equals(flow.from)) {
          senderRegistered = true;
          break;
        }
      }
      if (!senderRegistered) {
        localParticipants.push(flow.from);
      }

      let recipientRegistered = false;
      for (let j = 0; j < localParticipants.length; j++) {
        if (localParticipants[j].equals(flow.to)) {
          recipientRegistered = true;
          break;
        }
      }
      if (!recipientRegistered) {
        localParticipants.push(flow.to);
      }
    }

    // Create approval actions for each approver
    for (let i = 0; i < approvers.length; i++) {
      const approver = approvers[i];
      const approval = fetchXvPSettlementApproval(
        event.params.settlement,
        approver
      );
      createAction(
        event.block.timestamp,
        ActionName.ApproveXvPSettlement,
        event.params.settlement,
        event.block.timestamp,
        xvpSettlement.cutoffDate,
        [approval.account],
        null,
        createActionIdentifier(ActionName.ApproveXvPSettlement, [
          event.params.settlement,
          approval.account,
        ])
      );
    }

    for (let i = 0; i < localParticipants.length; i++) {
      fetchXvPSettlementCancelVote(event.params.settlement, localParticipants[i]);
    }
  }
}
