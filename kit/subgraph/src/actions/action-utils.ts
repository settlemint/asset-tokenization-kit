import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Action, ActionExecutor } from "../../generated/schema";

/**
 * Creates or updates an ActionExecutor entity
 */
export function getOrCreateActionExecutor(
  executorId: Bytes,
  executors: Bytes[]
): ActionExecutor {
  let actionExecutor = ActionExecutor.load(executorId);
  if (!actionExecutor) {
    actionExecutor = new ActionExecutor(executorId);
    actionExecutor.executors = executors;
    actionExecutor.save();
  }
  return actionExecutor;
}

/**
 * Creates an Action entity
 */
export function createAction(
  actionId: Bytes,
  executor: ActionExecutor,
  name: string,
  type: string,
  createdAt: BigInt,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  target: Bytes
): Action {
  let action = new Action(actionId);
  action.executor = executor.id;
  action.name = name;
  action.type = type;
  action.createdAt = createdAt;
  action.activeAt = activeAt;
  action.expiresAt = expiresAt;
  action.executedAt = null;
  action.executed = false;
  action.target = target;
  action.executedBy = null;
  action.save();
  
  return action;
}

/**
 * Marks an action as executed
 */
export function executeAction(
  actionId: Bytes,
  executedAt: BigInt,
  executedBy: Bytes
): void {
  let action = Action.load(actionId);
  if (action) {
    action.executed = true;
    action.executedAt = executedAt;
    action.executedBy = executedBy;
    action.save();
  }
}