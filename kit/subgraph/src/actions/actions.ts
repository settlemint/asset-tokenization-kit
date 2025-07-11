import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Action } from "../../generated/schema";

// Action type constants
export const ACTION_TYPE_ADMIN = "ADMIN";
export const ACTION_TYPE_USER = "USER";

// Action status constants
export const ACTION_STATUS_PENDING = "PENDING";
export const ACTION_STATUS_UPCOMING = "UPCOMING";
export const ACTION_STATUS_COMPLETED = "COMPLETED";

/**
 * Creates a new action entity
 */
export function createAction(
  id: Bytes,
  type: string,
  status: string,
  title: string,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  description: string | null = null,
  dueDate: BigInt | null = null,
  assignedTo: Bytes | null = null,
  token: Bytes | null = null,
  relatedEvent: Bytes | null = null
): Action {
  let action = new Action(id);

  action.type = type;
  action.status = status;
  action.title = title;
  action.description = description;
  action.dueDate = dueDate;
  action.createdAt = BigInt.fromI32(Date.now());
  action.updatedAt = BigInt.fromI32(Date.now());
  action.createdBy = createdBy;
  action.assignedTo = assignedTo;
  action.token = token;
  action.relatedEvent = relatedEvent;
  action.deployedInTransaction = deployedInTransaction;

  action.save();
  return action;
}

/**
 * Updates an existing action status
 */
export function updateActionStatus(
  id: Bytes,
  newStatus: string,
  assignedTo: Bytes | null = null
): Action | null {
  let action = Action.load(id);
  if (!action) {
    return null;
  }

  action.status = newStatus;
  action.updatedAt = BigInt.fromI32(Date.now());

  if (assignedTo) {
    action.assignedTo = assignedTo;
  }

  action.save();
  return action;
}

/**
 * Creates admin action for system operations
 */
export function createAdminAction(
  actionId: Bytes,
  title: string,
  description: string,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  relatedEvent: Bytes | null = null,
  dueDate: BigInt | null = null
): Action {
  return createAction(
    actionId,
    ACTION_TYPE_ADMIN,
    ACTION_STATUS_PENDING,
    title,
    createdBy,
    deployedInTransaction,
    description,
    dueDate,
    null, // assignedTo - to be assigned by admin
    null, // token
    relatedEvent
  );
}

/**
 * Creates user action for user operations
 */
export function createUserAction(
  actionId: Bytes,
  title: string,
  description: string,
  createdBy: Bytes,
  assignedTo: Bytes,
  deployedInTransaction: Bytes,
  relatedEvent: Bytes | null = null,
  dueDate: BigInt | null = null,
  token: Bytes | null = null
): Action {
  return createAction(
    actionId,
    ACTION_TYPE_USER,
    ACTION_STATUS_PENDING,
    title,
    createdBy,
    deployedInTransaction,
    description,
    dueDate,
    assignedTo,
    token,
    relatedEvent
  );
}

/**
 * Creates upcoming action for scheduled operations
 */
export function createUpcomingAction(
  actionId: Bytes,
  title: string,
  description: string,
  createdBy: Bytes,
  deployedInTransaction: Bytes,
  dueDate: BigInt,
  relatedEvent: Bytes | null = null,
  assignedTo: Bytes | null = null,
  token: Bytes | null = null
): Action {
  return createAction(
    actionId,
    ACTION_TYPE_USER,
    ACTION_STATUS_UPCOMING,
    title,
    createdBy,
    deployedInTransaction,
    description,
    dueDate,
    assignedTo,
    token,
    relatedEvent
  );
}

/**
 * Completes an action
 */
export function completeAction(actionId: Bytes): Action | null {
  return updateActionStatus(actionId, ACTION_STATUS_COMPLETED);
}

/**
 * Generates a unique action ID
 */
export function generateActionId(
  transactionHash: Bytes,
  logIndex: BigInt,
  suffix: string = ""
): Bytes {
  return Bytes.fromUTF8(
    transactionHash.toHex() + "-" + logIndex.toString() + "-action" + suffix
  );
}
