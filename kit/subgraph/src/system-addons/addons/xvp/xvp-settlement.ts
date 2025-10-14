import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Action,
  XvPSettlement,
  XvPSettlementApproval,
  XvPSettlementFlow,
} from "../../../../generated/schema";
import { XvPSettlement as XvPSettlementTemplate } from "../../../../generated/templates";
import {
  XvPSettlementApprovalRevoked,
  XvPSettlementApproved,
  XvPSettlementCancelled,
  XvPSettlement as XvPSettlementContract,
  XvPSettlementExecuted,
} from "../../../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAccount } from "../../../account/fetch/account";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchToken } from "../../../token/fetch/token";
import {
  actionExecuted,
  actionId,
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../../utils/actions";
import { setBigNumber } from "../../../utils/bignumber";

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
  actionExecuted(
    event,
    ActionName.ApproveXvPSettlement,
    event.address,
    createActionIdentifier(ActionName.ApproveXvPSettlement, [
      event.address,
      approval.account,
    ])
  );

  if (xvpSettlement.autoExecute) {
    return;
  }

  // Manual approval lookup instead of using derived field .load()
  // Get flows from contract to extract approver addresses
  const settlementContract = XvPSettlementContract.bind(event.address);
  const flows = settlementContract.try_flows();

  if (flows.reverted) {
    return;
  }

  const approvers: Address[] = [];

  // Collect unique approvers (from addresses) from flows
  for (let i = 0; i < flows.value.length; i++) {
    const flow = flows.value[i];

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

  // Check if all approvals are done
  let allApproved = true;
  const participants: Bytes[] = [];

  for (let i = 0; i < approvers.length; i++) {
    const approval = fetchXvPSettlementApproval(event.address, approvers[i]);
    if (!approval.approved) {
      allApproved = false;
      break;
    }
    participants.push(approval.account);
  }

  if (allApproved) {
    // Check if ExecuteXvPSettlement action already exists to prevent duplicates
    const executeActionIdentifier = createActionIdentifier(
      ActionName.ExecuteXvPSettlement,
      [event.address]
    );
    const executeActionId = actionId(
      ActionName.ExecuteXvPSettlement,
      event.address,
      executeActionIdentifier
    );
    const existingExecuteAction = Action.load(executeActionId);

    if (!existingExecuteAction) {
      createAction(
        event,
        ActionName.ExecuteXvPSettlement,
        event.address,
        event.block.timestamp,
        xvpSettlement.cutoffDate,
        participants,
        null,
        executeActionIdentifier
      );
    }
  }
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
  approval.timestamp = null;
  approval.save();
}

export function handleXvPSettlementExecuted(
  event: XvPSettlementExecuted
): void {
  fetchEvent(event, "XvPSettlementExecuted");

  const xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.executed = true;
  xvpSettlement.save();

  actionExecuted(
    event,
    ActionName.ExecuteXvPSettlement,
    event.address,
    createActionIdentifier(ActionName.ExecuteXvPSettlement, [event.address])
  );
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  fetchEvent(event, "XvPSettlementCancelled");

  const xvpSettlement = fetchXvPSettlement(event.address);
  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
