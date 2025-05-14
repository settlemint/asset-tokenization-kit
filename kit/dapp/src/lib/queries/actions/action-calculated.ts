import "server-only";

import { safeParse } from "@/lib/utils/typebox";
import { isAfter, isBefore } from "date-fns";
import {
  ActionSchema,
  type Action,
  type ActionStatus,
  type OnchainAction,
} from "./actions-schema";

/**
 * Calculates the status of an action based on its execution, expiration, and activation times
 *
 * @param action - The onchain action data
 * @returns The calculated action status
 */
function calculateActionStatus(action: OnchainAction): ActionStatus {
  if (action.executed) {
    return "COMPLETED";
  }

  const isExpired = action.expiresAt
    ? isBefore(action.expiresAt, new Date())
    : false;

  if (isExpired) {
    return "EXPIRED";
  }

  const isUpcoming = isAfter(action.activeAt, new Date());
  if (isUpcoming) {
    return "UPCOMING";
  }

  return "PENDING";
}

/**
 * Enriches an onchain action with calculated fields like status
 *
 * @param onchainAction - The raw action data
 * @returns The enriched action with calculated fields
 */
export function calculateAction(onchainAction: OnchainAction): Action {
  const status = calculateActionStatus(onchainAction);

  return safeParse(ActionSchema, {
    ...onchainAction,
    status,
  });
}

/**
 * Enriches an array of onchain actions with calculated fields
 *
 * @param onchainActions - Array of raw action data
 * @returns Array of enriched actions with calculated fields
 */
export function calculateActions(onchainActions: OnchainAction[]): Action[] {
  return onchainActions.map(calculateAction);
}
