import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";

import { Action, ActionExecutor, ActionStatus } from "../../generated/schema";

export class ActionName {
  static ApproveXvPSettlement: string = "ApproveXvPSettlement";
  static ExecuteXvPSettlement: string = "ExecuteXvPSettlement";
  static MatureBond: string = "MatureBond";
}

function getActionStatus(
  currentTime: BigInt,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  executed: boolean
): ActionStatus {
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

export function updateActionStatus(action: Action, currentTime: BigInt): void {
  const newStatus = getActionStatus(
    currentTime,
    action.activeAt,
    action.expiresAt,
    action.executed
  );
  if (action.status !== newStatus) {
    action.status = newStatus;
    action.save();
  }
}

export function actionId(
  actionName: string,
  target: Bytes,
  identifier: string | null
): Bytes {
  let idString = `${actionName}-${target.toHexString()}`;
  if (identifier) {
    idString += `-${identifier}`;
  }
  return Bytes.fromUTF8(idString);
}

export function actionExecutorId(
  target: Bytes,
  requiredRole: string | null,
  identifier: string | null
): Bytes {
  let idString = `${target.toHexString()}`;
  if (requiredRole) {
    idString += `-${requiredRole}`;
  }
  if (identifier) {
    idString += `-${identifier}`;
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
    // Update the executors array with new executors (fixing bug #2)
    actionExecutor.executors = executors;
    actionExecutor.save();
  } else {
    // Create new ActionExecutor
    actionExecutor = new ActionExecutor(id);
    actionExecutor.executors = executors;
    actionExecutor.save();
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
  action.executedBy = event.transaction.from;
  action.status = ActionStatus.EXECUTED;
  action.save();

  log.info(
    "Action executed successfully: {} - actionName: {}, target: {}, executedBy: {}",
    [
      id.toHexString(),
      actionName,
      target.toHexString(),
      event.transaction.from.toHexString(),
    ]
  );
}
