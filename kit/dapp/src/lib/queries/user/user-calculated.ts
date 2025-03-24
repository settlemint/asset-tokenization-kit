import { safeParse } from "@/lib/utils/typebox";
import type { Account, CalculatedUser, User } from "./user-schema";
import { CalculatedUserSchema } from "./user-schema";

/**
 * Calculates additional fields for user data
 *
 * @param user - User data from Hasura
 * @param account - Account data from The Graph (optional)
 * @returns Calculated fields for the user
 */
export function userCalculateFields(
  _user: User,
  account?: Account
): CalculatedUser {
  // Calculate asset count from account data
  const assetCount = account?.balancesCount ?? 0;

  // Calculate transaction count from account data
  const transactionCount = account?.activityEventsCount ?? 0;

  return safeParse(CalculatedUserSchema, {
    assetCount,
    transactionCount,
  });
}
