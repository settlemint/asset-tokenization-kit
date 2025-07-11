import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  createUserAction,
  createAdminAction,
  generateActionId,
} from "../actions";

/**
 * Creates an action for XVP settlement approval
 */
export function createXvPSettlementApprovalAction(
  transactionHash: Bytes,
  logIndex: BigInt,
  settlementAddress: Bytes,
  approver: Bytes,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  relatedEvent: Bytes
): void {
  let actionId = generateActionId(transactionHash, logIndex, "-xvp-approval");

  createUserAction(
    actionId,
    "XVP Settlement Approval Required",
    "Your approval is required for the XVP settlement execution",
    createdBy,
    approver,
    deployedInTransaction,
    relatedEvent
  );
}

/**
 * Creates an action for XVP settlement execution
 */
export function createXvPSettlementExecutionAction(
  transactionHash: Bytes,
  logIndex: BigInt,
  settlementAddress: Bytes,
  cutoffDate: BigInt,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  relatedEvent: Bytes
): void {
  let actionId = generateActionId(transactionHash, logIndex, "-xvp-execution");

  createAdminAction(
    actionId,
    "XVP Settlement Ready for Execution",
    "XVP settlement has received all required approvals and is ready for execution",
    createdBy,
    deployedInTransaction,
    relatedEvent,
    cutoffDate
  );
}
