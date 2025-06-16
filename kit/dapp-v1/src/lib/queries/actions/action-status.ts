import { isAfter, isBefore } from "date-fns";
import type { Action, ActionStatus } from "./actions-schema";

/**
 * Calculates the status of an action based on execution, expiration, and active time
 *
 * @param action - The raw action data from The Graph
 * @returns The calculated Action status
 */
export function calculateActionStatus(action: Action): ActionStatus {
  if (action.executed) {
    return "COMPLETED";
  }

  const now = new Date();

  // If the action is not yet active
  if (isAfter(action.activeAt, now)) {
    return "UPCOMING";
  }

  // If the action has expired
  if (action.expiresAt !== null && isBefore(action.expiresAt, now)) {
    return "EXPIRED";
  }

  // Action is active but not executed
  return "PENDING";
}
