import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { Action, ActionExecutor } from "../../generated/schema";

export class ActionName {
  static ApproveXvPSettlement: string = "ApproveXvPSettlement";
  static ExecuteXvPSettlement: string = "ExecuteXvPSettlement";
  static MatureBond: string = "MatureBond";
}

export class ActionType {
  static Admin: string = "Admin";
  static User: string = "User";
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
  type: string,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  executors: Bytes[],
  requiredRole: string | null,
  identifier: string | null
): Action {
  const id = actionId(actionName, target, identifier);
  const action = new Action(id);
  action.name = actionName;
  action.type = type;
  action.target = target;
  action.createdAt = event.block.timestamp;
  action.activeAt = activeAt;
  action.expiresAt = expiresAt;
  action.requiredRole = requiredRole;
  action.executed = false;
  action.executedAt = null;
  action.executedBy = null;
  action.identifier = identifier;
  action.save();

  createActionExecutor(action, executors, identifier);

  return action;
}

export function createActionExecutor(
  action: Action,
  executors: Bytes[],
  identifier: string | null
): ActionExecutor {
  const id = actionExecutorId(action.target, action.requiredRole, identifier);
  let actionExecutor = ActionExecutor.load(id);
  if (actionExecutor !== null) {
    let existingActions = actionExecutor.actions;
    existingActions.push(action.id);
    actionExecutor.actions = existingActions;
    actionExecutor.save();
    return actionExecutor;
  }

  actionExecutor = new ActionExecutor(id);
  actionExecutor.executors = executors;
  actionExecutor.actions = [action.id];
  actionExecutor.save();

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
  if (action !== null) {
    action.executed = true;
    action.executedAt = event.block.timestamp;
    action.executedBy = event.transaction.from;
    action.save();
  }
}
