import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Action } from "../../../generated/schema";

/**
 * Fetches an action entity by ID
 */
export function fetchAction(id: Bytes): Action | null {
  return Action.load(id);
}

/**
 * Fetches all actions for a given account
 */
export function fetchActionsForAccount(accountId: Bytes): Action[] {
  // Note: This would typically use a derived field or subgraph query
  // For now, we'll return an empty array since direct filtering isn't supported
  return [];
}

/**
 * Fetches all actions for a given token
 */
export function fetchActionsForToken(tokenId: Bytes): Action[] {
  // Note: This would typically use a derived field or subgraph query
  // For now, we'll return an empty array since direct filtering isn't supported
  return [];
}
