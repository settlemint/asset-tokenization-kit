import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  XvPSettlement,
  XvPSettlementApproval,
  XvPSettlementFlow,
} from "../../../../generated/schema";
import { XvPSettlement as XvPSettlementTemplate } from "../../../../generated/templates";
import { XvPSettlement as XvPSettlementContract } from "../../../../generated/templates/XvPSettlement/XvPSettlement";
import { XvPSettlementApproved } from "../../../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAccount } from "../../../account/fetch/account";
import { fetchToken } from "../../../token/fetch/token";
import { setBigNumber } from "../../../utils/bignumber";
import { createAction, ActionName, ActionType } from "../../../actions/action";
import { fetchEvent } from "../../../event/fetch/event";

/**
 * Fetches or creates a Flow entity
 * @param settlementId The address of the XvPSettlement contract
 * @param asset The asset address
 * @param from The from address
 * @param to The to address
 * @param amountExact The exact amount
 * @param index The index of the flow in the flows array
 * @returns The Flow entity
 */
export function fetchXvPSettlementFlow(
  settlementId: Address,
  asset: Address,
  from: Address,
  to: Address,
  amountExact: BigInt,
  index: i32
): XvPSettlementFlow {
  const flowId = settlementId.concat(Bytes.fromI32(index));
  let flow = XvPSettlementFlow.load(flowId);
  if (flow) {
    return flow;
  }

  flow = new XvPSettlementFlow(flowId);
  flow.xvpSettlement = settlementId;
  flow.asset = fetchToken(asset).id;
  flow.from = fetchAccount(from).id;
  flow.to = fetchAccount(to).id;

  const token = fetchToken(asset);
  setBigNumber(flow, "amount", amountExact, token.decimals);
  flow.save();
  return flow;
}

export function fetchXvPSettlementApproval(
  contractAddress: Address,
  senderAddress: Address
): XvPSettlementApproval {
  const id = contractAddress.concat(senderAddress);
  let approval = XvPSettlementApproval.load(id);
  if (approval) {
    return approval;
  }

  approval = new XvPSettlementApproval(id);
  approval.xvpSettlement = contractAddress;
  approval.account = fetchAccount(senderAddress).id;
  approval.approved = false;
  approval.timestamp = null;
  approval.save();
  return approval;
}

/**
 * Fetches or creates a XvPSettlement entity
 * @param id The address of the XvPSettlement
 * @returns The XvPSettlement entity
 */
export function fetchXvPSettlement(id: Address): XvPSettlement {
  let xvpSettlement = XvPSettlement.load(id);

  if (xvpSettlement == null) {
    const endpoint = XvPSettlementContract.bind(id);
    const cutoffDate = endpoint.try_cutoffDate();
    const autoExecute = endpoint.try_autoExecute();
    const executed = endpoint.try_executed();
    const cancelled = endpoint.try_cancelled();
    const flows = endpoint.try_flows();
    const createdAt = endpoint.try_createdAt();
    const name = endpoint.try_name();

    xvpSettlement = new XvPSettlement(id);
    xvpSettlement.cutoffDate = cutoffDate.reverted
      ? BigInt.zero()
      : cutoffDate.value;
    xvpSettlement.autoExecute = autoExecute.reverted
      ? false
      : autoExecute.value;
    xvpSettlement.executed = executed.reverted ? false : executed.value;
    xvpSettlement.cancelled = cancelled.reverted ? false : cancelled.value;
    xvpSettlement.createdAt = createdAt.reverted
      ? BigInt.zero()
      : createdAt.value;
    xvpSettlement.name = name.reverted ? "" : name.value;
    xvpSettlement.deployedInTransaction = Bytes.empty();

    const approvers: Address[] = [];

    if (!flows.reverted) {
      for (let i = 0; i < flows.value.length; i++) {
        const flow = flows.value[i];

        // Create flow entity with index-based ID
        fetchXvPSettlementFlow(
          id,
          flow.asset,
          flow.from,
          flow.to,
          flow.amount,
          i
        );

        // Collect unique approvers (from addresses)
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
      }
    }

    xvpSettlement.save();

    // Create template for dynamic tracking
    XvPSettlementTemplate.create(id);

    // Create approval entities for all approvers
    for (let i = 0; i < approvers.length; i++) {
      fetchXvPSettlementApproval(id, approvers[i]);
    }
  }

  return xvpSettlement;
}

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
  const approvals = xvpSettlement.approvals.load();

  let allApproved = true;
  for (let i = 0; i < approvals.length; i++) {
    if (!approvals[i].approved) {
      allApproved = false;
      break;
    }
  }

  // if (allApproved) {
  //   const participants: Bytes[] = [];
  //   for (let i = 0; i < approvals.length; i++) {
  //     // Extract the original address from the approval ID: contractAddress.concat(senderAddress)
  //     // The approval ID contains: [contractAddress (20 bytes)][senderAddress (20 bytes)]
  //     const originalAddressBytes = Bytes.fromUint8Array(
  //       approvals[i].id.subarray(20)
  //     );
  //     participants.push(originalAddressBytes);
  //   }

  //   createAction(
  //     event,
  //     ActionName.ExecuteXvPSettlement,
  //     event.address,
  //     ActionType.User,
  //     event.block.timestamp,
  //     xvpSettlement.cutoffDate,
  //     participants,
  //     null,
  //     null
  //   );
  // }
}
