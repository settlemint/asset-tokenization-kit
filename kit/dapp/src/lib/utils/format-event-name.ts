import { capitalCase } from "change-case";

/**
 * Formats an event name by removing leading/trailing underscores
 * and converting camelCase to properly capitalized space-separated strings
 *
 * @param eventName - The raw event name to format
 * @returns The formatted event name
 *
 * @example
 * formatEventName("_Transfer") -> "Transfer"
 * formatEventName("TokenMinted_") -> "Token Minted"
 * formatEventName("__userAccountCreated__") -> "User Account Created"
 * formatEventName("OwnershipTransferred") -> "Ownership Transferred"
 */
export function formatEventName(eventName: string): string {
  // Remove leading and trailing underscores
  const trimmed = eventName.replaceAll(/^_+|_+$/g, "");

  // Convert to capital case (handles camelCase, PascalCase, snake_case, etc.)
  return capitalCase(trimmed);
}
