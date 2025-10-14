import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";

import { Action, ActionExecutor } from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";

// ActionStatus constants (enum-like values)
export class ActionStatus {
  static PENDING: string = "PENDING";
  static ACTIVE: string = "ACTIVE";
  static EXECUTED: string = "EXECUTED";
  static EXPIRED: string = "EXPIRED";
}

export class ActionName {
  static ApproveXvPSettlement: string = "ApproveXvPSettlement";
  static ExecuteXvPSettlement: string = "ExecuteXvPSettlement";
  static MatureBond: string = "MatureBond";
  static RedeemBond: string = "RedeemBond";
  static ClaimYield: string = "ClaimYield";
}

/**
 * Identifier patterns for different action types:
 * - ApproveXvPSettlement: uses settlement address and acccount address as identifiers
 * - ExecuteXvPSettlement: uses settlement address as identifier
 * - MatureBond: uses token address as identifier
 * - RedeemBond: uses token address and account address as identifiers
 * - ClaimYield: uses fixed yield schedule address, acccount and period as identifiers
 *
 * This ensures consistent and predictable action IDs across all action types.
 */
export function createActionIdentifier(
  actionName: string,
  identifiers: Bytes[]
): string {
  if (identifiers.length === 0) {
    log.error("createActionIdentifier: identifiers array cannot be empty", []);
    throw new Error(
      "createActionIdentifier: identifiers array cannot be empty"
    );
  }
  if (
    (actionName === ActionName.ExecuteXvPSettlement ||
      actionName === ActionName.MatureBond) &&
    identifiers.length !== 1
  ) {
    log.error("createActionIdentifier: Expected 1 identifier, got {}", [
      identifiers.length.toString(),
    ]);
    throw new Error(
      `createActionIdentifier: Expected 1 identifier, got ${identifiers.length}`
    );
  }
  if (
    (actionName === ActionName.ApproveXvPSettlement ||
      actionName === ActionName.RedeemBond) &&
    identifiers.length !== 2
  ) {
    log.error("createActionIdentifier: Expected 2 identifiers, got {}", [
      identifiers.length.toString(),
    ]);
    throw new Error(
      `createActionIdentifier: Expected 2 identifiers, got ${identifiers.length}`
    );
  }
  if (actionName === ActionName.ClaimYield && identifiers.length !== 3) {
    log.error("createActionIdentifier: Expected 3 identifiers, got {}", [
      identifiers.length.toString(),
    ]);
    throw new Error(
      `createActionIdentifier: Expected 3 identifiers, got ${identifiers.length}`
    );
  }
  return identifiers.map<string>((entity) => entity.toHexString()).join("");
}

function getActionStatus(
  currentTime: BigInt,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  executed: boolean
): string {
  if (executed) {
    return ActionStatus.EXECUTED;
  }

  if (expiresAt !== null && currentTime.gt(expiresAt)) {
    return ActionStatus.EXPIRED;
  }

  if (currentTime.ge(activeAt)) {
    return ActionStatus.ACTIVE;
  }

  return ActionStatus.PENDING;
}

function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  // EXECUTED status is terminal - no transitions allowed
  if (currentStatus === ActionStatus.EXECUTED) {
    return newStatus === ActionStatus.EXECUTED;
  }

  // EXPIRED status is terminal - no transitions allowed
  if (currentStatus === ActionStatus.EXPIRED) {
    return newStatus === ActionStatus.EXPIRED;
  }

  // Valid transitions from PENDING
  if (currentStatus === ActionStatus.PENDING) {
    return (
      newStatus === ActionStatus.PENDING ||
      newStatus === ActionStatus.ACTIVE ||
      newStatus === ActionStatus.EXECUTED ||
      newStatus === ActionStatus.EXPIRED
    );
  }

  // Valid transitions from ACTIVE
  if (currentStatus === ActionStatus.ACTIVE) {
    return (
      newStatus === ActionStatus.ACTIVE ||
      newStatus === ActionStatus.EXECUTED ||
      newStatus === ActionStatus.EXPIRED
    );
  }

  return false;
}

export function updateActionStatus(action: Action, currentTime: BigInt): void {
  const newStatus = getActionStatus(
    currentTime,
    action.activeAt,
    action.expiresAt,
    action.status === ActionStatus.EXECUTED
  );

  // Validate status transition
  if (!isValidStatusTransition(action.status, newStatus)) {
    log.error(
      "Invalid status transition attempted for action: {} - from: {} to: {}",
      [action.id.toHexString(), action.status, newStatus]
    );
    return;
  }

  if (action.status !== newStatus) {
    const oldStatus = action.status;
    action.status = newStatus;
    action.save();

    log.info("Action status updated: {} - from: {} to: {}", [
      action.id.toHexString(),
      oldStatus,
      newStatus,
    ]);
  }
}

function actionId(
  actionName: string,
  target: Bytes,
  identifier: string | null
): Bytes {
  let idString = `${actionName}-${target.toHexString()}`;
  // Use consistent delimiter handling to prevent ID collisions
  // Always append delimiter for identifier field, even if null
  if (identifier !== null && identifier.length > 0) {
    idString += `-${identifier}`;
  } else {
    idString += "-null";
  }
  return Bytes.fromUTF8(idString);
}

function actionExecutorId(
  target: Bytes,
  requiredRole: string | null,
  identifier: string | null
): Bytes {
  let idString = `${target.toHexString()}`;
  // Use consistent delimiter handling to prevent ID collisions
  if (requiredRole !== null && requiredRole.length > 0) {
    idString += `-${requiredRole}`;
  } else {
    idString += "-null";
  }
  if (identifier !== null && identifier.length > 0) {
    idString += `-${identifier}`;
  } else {
    idString += "-null";
  }
  return Bytes.fromUTF8(idString);
}

export function actionExists(
  actionName: string,
  target: Bytes,
  identifier: string
): boolean {
  const id = actionId(actionName, target, identifier);
  return Action.load(id) !== null;
}

export function createAction(
  event: ethereum.Event,
  actionName: string,
  target: Bytes,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  executors: Bytes[],
  requiredRole: string | null,
  identifier: string | null
): Action {
  // Input validation
  if (actionName.length === 0) {
    log.error("createAction: actionName cannot be empty", []);
    throw new Error("createAction: actionName cannot be empty");
  }

  if (executors.length === 0) {
    log.error(
      "createAction: executors array cannot be empty - actionName: {}, target: {}",
      [actionName, target.toHexString()]
    );
    throw new Error("createAction: executors array cannot be empty");
  }

  if (activeAt.lt(event.block.timestamp)) {
    log.warning(
      "createAction: activeAt is in the past - actionName: {}, target: {}, activeAt: {}, currentTime: {}",
      [
        actionName,
        target.toHexString(),
        activeAt.toString(),
        event.block.timestamp.toString(),
      ]
    );
  }

  if (expiresAt !== null && expiresAt.le(activeAt)) {
    log.error(
      "createAction: expiresAt must be after activeAt - actionName: {}, target: {}, activeAt: {}, expiresAt: {}",
      [
        actionName,
        target.toHexString(),
        activeAt.toString(),
        expiresAt.toString(),
      ]
    );
    throw new Error("createAction: expiresAt must be after activeAt");
  }

  const id = actionId(actionName, target, identifier);

  // Check if action already exists
  const existingAction = Action.load(id);
  if (existingAction !== null) {
    log.error(
      "createAction: Action already exists - actionName: {}, target: {}, identifier: {}",
      [actionName, target.toHexString(), identifier ? identifier : "null"]
    );
    throw new Error("createAction: Action already exists");
  }

  const action = new Action(id);
  action.name = actionName;
  action.target = target;
  action.createdAt = event.block.timestamp;
  action.activeAt = activeAt;
  action.expiresAt = expiresAt;
  action.requiredRole = requiredRole;
  action.executedAt = null;
  action.executedBy = null;
  action.identifier = identifier;
  action.status = getActionStatus(
    event.block.timestamp,
    activeAt,
    expiresAt,
    false
  );

  // Create/update the executor and establish relationship without saving action yet
  const actionExecutor = createActionExecutorInternal(
    action,
    executors,
    identifier
  );
  action.executor = actionExecutor.id;

  // Save action only once after all fields are set
  action.save();

  log.info(
    "Action created successfully: {} - actionName: {}, target: {}, activeAt: {}",
    [id.toHexString(), actionName, target.toHexString(), activeAt.toString()]
  );

  return action;
}

// Internal function used by createAction to avoid double save
function createActionExecutorInternal(
  action: Action,
  executors: Bytes[],
  identifier: string | null
): ActionExecutor {
  const id = actionExecutorId(action.target, action.requiredRole, identifier);
  let actionExecutor = ActionExecutor.load(id);

  if (actionExecutor !== null) {
    // Merge executors instead of overwriting to prevent data loss
    const existingExecutors = actionExecutor.executors;
    const mergedExecutors: Bytes[] = [];

    // Add existing executors
    for (let i = 0; i < existingExecutors.length; i++) {
      mergedExecutors.push(existingExecutors[i]);
    }

    // Add new executors if they don't already exist
    for (let i = 0; i < executors.length; i++) {
      let alreadyExists = false;
      for (let j = 0; j < existingExecutors.length; j++) {
        if (existingExecutors[j].equals(executors[i])) {
          alreadyExists = true;
          break;
        }
      }
      if (!alreadyExists) {
        mergedExecutors.push(executors[i]);
      }
    }

    actionExecutor.executors = mergedExecutors;
    actionExecutor.save();

    log.info(
      "ActionExecutor updated with merged executors: {} - existing: {}, new: {}, merged: {}",
      [
        id.toHexString(),
        existingExecutors.length.toString(),
        executors.length.toString(),
        mergedExecutors.length.toString(),
      ]
    );
  } else {
    // Create new ActionExecutor
    actionExecutor = new ActionExecutor(id);
    actionExecutor.executors = executors;
    actionExecutor.save();

    log.info("ActionExecutor created: {} - executors: {}", [
      id.toHexString(),
      executors.length.toString(),
    ]);
  }

  return actionExecutor;
}

export function actionExecuted(
  event: ethereum.Event,
  actionName: string,
  target: Bytes,
  identifier: string | null
): void {
  const id = actionId(actionName, target, identifier);
  const action = Action.load(id);

  if (action === null) {
    log.warning(
      "Action not found for execution: {} - actionName: {}, target: {}, identifier: {}",
      [
        id.toHexString(),
        actionName,
        target.toHexString(),
        identifier ? identifier : "null",
      ]
    );
    return;
  }

  if (action.status === ActionStatus.EXECUTED) {
    log.warning(
      "Action already executed: {} - actionName: {}, target: {}, identifier: {}",
      [
        id.toHexString(),
        actionName,
        target.toHexString(),
        identifier ? identifier : "null",
      ]
    );
    return;
  }

  action.executedAt = event.block.timestamp;
  const executedBy = fetchAccount(event.transaction.from);
  action.executedBy = executedBy.id;
  action.status = ActionStatus.EXECUTED;
  action.save();

  log.info(
    "Action executed successfully: {} - actionName: {}, target: {}, executedBy: {}",
    [
      id.toHexString(),
      actionName,
      target.toHexString(),
      executedBy.id.toHexString(),
    ]
  );
}
