import { BigInt, Bytes, log, Address } from "@graphprotocol/graph-ts";
import { Action, ActionExecutor } from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";

/**
 * Creates or updates an ActionExecutor entity
 * Merges new executors with existing ones to prevent duplicate entities
 */
export function getOrCreateActionExecutor(
  executorId: Bytes,
  executors: Bytes[]
): ActionExecutor {
  let actionExecutor = ActionExecutor.load(executorId);
  if (!actionExecutor) {
    actionExecutor = new ActionExecutor(executorId);
    // Convert Bytes to proper Account entity references
    const accountExecutors: Bytes[] = [];
    for (let i = 0; i < executors.length; i++) {
      accountExecutors.push(fetchAccount(Address.fromBytes(executors[i])).id);
    }
    actionExecutor.executors = accountExecutors;
    actionExecutor.save();
  } else {
    // Merge new executors with existing ones, avoiding duplicates
    const existingExecutors = actionExecutor.executors;
    const mergedExecutors: Bytes[] = [];
    
    // Add all existing executors
    for (let i = 0; i < existingExecutors.length; i++) {
      mergedExecutors.push(existingExecutors[i]);
    }
    
    // Add new executors only if they don't already exist
    for (let i = 0; i < executors.length; i++) {
      const accountId = fetchAccount(Address.fromBytes(executors[i])).id;
      let exists = false;
      for (let j = 0; j < existingExecutors.length; j++) {
        if (accountId.equals(existingExecutors[j])) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        mergedExecutors.push(accountId);
      }
    }
    
    actionExecutor.executors = mergedExecutors;
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
): Action | null {
  // Check if action already exists
  let existingAction = Action.load(actionId);
  if (existingAction) {
    log.warning("Action already exists: {}", [actionId.toHexString()]);
    return existingAction;
  }
  
  // Validate input parameters
  if (!executor) {
    log.error("Cannot create action without executor: {}", [actionId.toHexString()]);
    return null;
  }
  
  if (name.length == 0) {
    log.error("Cannot create action with empty name: {}", [actionId.toHexString()]);
    return null;
  }
  
  if (type.length == 0) {
    log.error("Cannot create action with empty type: {}", [actionId.toHexString()]);
    return null;
  }
  
  // Validate time parameters
  if (activeAt.lt(createdAt)) {
    log.error("Action activeAt cannot be before createdAt: {}", [actionId.toHexString()]);
    return null;
  }
  
  if (expiresAt && expiresAt.le(activeAt)) {
    log.error("Action expiresAt cannot be before or equal to activeAt: {}", [actionId.toHexString()]);
    return null;
  }
  
  let action = new Action(actionId);
  action.executor = executor.id;
  action.name = name;
  action.type = type;
  action.createdAt = createdAt;
  action.activeAt = activeAt;
  action.expiresAt = expiresAt;
  action.executedAt = null;
  action.executed = false;
  
  // Ensure proper Account entity reference with error handling
  try {
    action.target = fetchAccount(Address.fromBytes(target)).id;
  } catch (error) {
    log.error("Failed to fetch target account for action: {}", [actionId.toHexString()]);
    return null;
  }
  
  action.executedBy = null;
  action.save();
  
  log.info("Action created successfully: {}", [actionId.toHexString()]);
  return action;
}

/**
 * Marks an action as executed with proper validation
 * Returns true if action was successfully executed, false otherwise
 */
export function executeAction(
  actionId: Bytes,
  executedAt: BigInt,
  executedBy: Bytes
): boolean {
  let action = Action.load(actionId);
  if (!action) {
    log.warning("Attempted to execute non-existent action: {}", [actionId.toHexString()]);
    return false;
  }
  
  if (action.executed) {
    log.warning("Attempted to execute already executed action: {}", [actionId.toHexString()]);
    return false;
  }
  
  // Validate that executedBy is authorized in the ActionExecutor
  let executor = ActionExecutor.load(action.executor);
  if (!executor) {
    log.warning("ActionExecutor not found for action: {}", [actionId.toHexString()]);
    return false;
  }
  
  // Check if executedBy is in the authorized executors array
  // Convert executedBy to Account entity reference for comparison
  const executedByAccountId = fetchAccount(Address.fromBytes(executedBy)).id;
  let isAuthorized = false;
  for (let i = 0; i < executor.executors.length; i++) {
    if (executor.executors[i].equals(executedByAccountId)) {
      isAuthorized = true;
      break;
    }
  }
  
  if (!isAuthorized) {
    log.warning("Unauthorized execution attempt by {} for action: {}", [executedBy.toHexString(), actionId.toHexString()]);
    return false;
  }
  
  // Check if action is still active (not expired)
  if (action.expiresAt && executedAt.gt(action.expiresAt)) {
    log.warning("Attempted to execute expired action: {}", [actionId.toHexString()]);
    return false;
  }
  
  // Check if action is active (activeAt has passed)
  if (executedAt.lt(action.activeAt)) {
    log.warning("Attempted to execute action before active time: {}", [actionId.toHexString()]);
    return false;
  }
  
  // All validations passed, execute the action
  action.executed = true;
  action.executedAt = executedAt;
  // Ensure proper Account entity reference
  action.executedBy = fetchAccount(Address.fromBytes(executedBy)).id;
  action.save();
  
  log.info("Action executed successfully: {}", [actionId.toHexString()]);
  return true;
}