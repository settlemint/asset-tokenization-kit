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
}

/**
 * Identifier patterns for different action types:
 * - ApproveXvPSettlement: use participant address as identifier (approval.account.toHexString())
 * - ExecuteXvPSettlement: use settlement address as identifier (settlement.address.toHexString())
 * - MatureBond: use bond address as identifier (bond.address.toHexString())
 *
 * This ensures consistent and predictable action IDs across all action types.
 */
export function createActionIdentifier(
  actionName: string,
  primaryEntity: Bytes,
  secondaryEntity: Bytes | null = null
): string {
  if (actionName === ActionName.ApproveXvPSettlement) {
    // For approval actions, use participant address as identifier
    if (secondaryEntity === null) {
      log.error(
        "createActionIdentifier: ApproveXvPSettlement requires participant address as secondaryEntity",
        []
      );
      throw new Error("ApproveXvPSettlement requires participant address");
    }
    return secondaryEntity.toHexString();
  }

  if (actionName === ActionName.ExecuteXvPSettlement) {
    // For execution actions, use settlement address as identifier
    return primaryEntity.toHexString();
  }

  if (actionName === ActionName.MatureBond) {
    // For bond actions, use bond address as identifier
    return primaryEntity.toHexString();
  }

  if (actionName === ActionName.RedeemBond) {
    if (secondaryEntity === null) {
      log.error(
        "createActionIdentifier: RedeemBond requires bond address as primaryEntity and participant address as secondaryEntity",
        []
      );
      throw new Error(
        "RedeemBond requires bond address as primaryEntity and participant address as secondaryEntity"
      );
    }
    return primaryEntity.concat(secondaryEntity).toHexString();
  }

  log.error("createActionIdentifier: Unknown action name: {}", [actionName]);
  throw new Error("Unknown action name");
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
    action.executed
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

export function actionId(
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

export function actionExecutorId(
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
  action.executed = false;
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

export function createActionExecutor(
  action: Action,
  executors: Bytes[],
  identifier: string | null
): ActionExecutor {
  const actionExecutor = createActionExecutorInternal(
    action,
    executors,
    identifier
  );

  // Set the executor field on the Action entity to establish the relationship
  action.executor = actionExecutor.id;
  action.save();

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

  if (action.executed) {
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

  action.executed = true;
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
