import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
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
import {
  createAction,
  executeAction,
  getOrCreateActionExecutor,
} from "../../../actions/action-utils";
import {
  ACTION_TYPES,
  ACTION_USER_TYPES,
} from "../../../constants/action-types";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchToken } from "../../../token/fetch/token";
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

    // Use array with indexOf for O(n) uniqueness checking instead of O(n²) nested loops
    const approverStrings: string[] = [];

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
        const approverString = flow.from.toHexString();
        if (approverStrings.indexOf(approverString) === -1) {
          approverStrings.push(approverString);
        }
      }
    }

    // Convert string array back to Address array
    const approvers: Address[] = [];
    for (let i = 0; i < approverStrings.length; i++) {
      approvers.push(Address.fromString(approverStrings[i]));
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

/**
 * Handles XvPSettlement approval events
 */
export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  fetchEvent(event, "XvPSettlementApproved");

  // Update approval entity
  const approval = fetchXvPSettlementApproval(
    event.address,
    event.params.sender
  );
  approval.approved = true;
  approval.timestamp = event.block.timestamp;
  approval.save();

  // Mark approval action as executed
  const actionId = event.address
    .concat(event.params.sender)
    .concat(Bytes.fromUTF8("approve"));
  const actionExecuted = executeAction(
    actionId,
    event.block.timestamp,
    event.params.sender
  );
  if (!actionExecuted) {
    log.warning("Failed to execute approval action for XvP settlement: {}", [
      event.address.toHexString(),
    ]);
  }

  // Check if all approvals are done and create execution action
  const settlement = fetchXvPSettlement(event.address);
  const approvals = settlement.approvals.load();
  let allApproved = true;

  for (let i = 0; i < approvals.length; i++) {
    if (!approvals[i].approved) {
      allApproved = false;
      break;
    }
  }

  if (allApproved && !settlement.executed && !settlement.cancelled) {
    // Create execution action for admin
    const actionExecutor = getOrCreateActionExecutor(
      event.address,
      [event.params.sender] // Admin who can execute
    );

    const executeActionId = event.address.concat(Bytes.fromUTF8("execute"));
    const executeAction = createAction(
      executeActionId,
      actionExecutor,
      ACTION_TYPES.EXECUTE_XVP_SETTLEMENT,
      ACTION_USER_TYPES.ADMIN,
      event.block.timestamp,
      event.block.timestamp,
      settlement.cutoffDate,
      event.address
    );

    if (!executeAction) {
      log.warning("Failed to create execute action for XvP settlement: {}", [
        event.address.toHexString(),
      ]);
    }
  }
}

/**
 * Handles XvPSettlement approval revocation events
 */
export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  fetchEvent(event, "XvPSettlementApprovalRevoked");

  // Update approval entity
  const approval = fetchXvPSettlementApproval(
    event.address,
    event.params.sender
  );
  approval.approved = false;
  approval.timestamp = event.block.timestamp;
  approval.save();

  // Recreate approval action
  const actionExecutor = getOrCreateActionExecutor(event.address, [
    event.params.sender,
  ]);

  const actionId = event.address
    .concat(event.params.sender)
    .concat(Bytes.fromUTF8("approve"));
  const settlement = fetchXvPSettlement(event.address);

  const approvalAction = createAction(
    actionId,
    actionExecutor,
    ACTION_TYPES.APPROVE_XVP_SETTLEMENT,
    ACTION_USER_TYPES.USER,
    event.block.timestamp,
    event.block.timestamp,
    settlement.cutoffDate,
    event.address
  );

  if (!approvalAction) {
    log.warning("Failed to create approval action for XvP settlement: {}", [
      event.address.toHexString(),
    ]);
  }
}

/**
 * Handles XvPSettlement execution events
 */
export function handleXvPSettlementExecuted(
  event: XvPSettlementExecuted
): void {
  fetchEvent(event, "XvPSettlementExecuted");

  // Update settlement entity
  const settlement = fetchXvPSettlement(event.address);
  settlement.executed = true;
  settlement.save();

  // Mark execution action as completed
  const executeActionId = event.address.concat(Bytes.fromUTF8("execute"));
  const actionExecuted = executeAction(
    executeActionId,
    event.block.timestamp,
    event.transaction.from
  );
  if (!actionExecuted) {
    log.warning("Failed to execute settlement action for XvP settlement: {}", [
      event.address.toHexString(),
    ]);
  }
}

/**
 * Handles XvPSettlement cancellation events
 */
export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  fetchEvent(event, "XvPSettlementCancelled");

  // Update settlement entity
  const settlement = fetchXvPSettlement(event.address);
  settlement.cancelled = true;
  settlement.save();

  // No need to create actions for cancelled settlements
  // Existing actions will expire naturally
}
