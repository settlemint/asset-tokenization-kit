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
  // Handle both string and bigint formats from account data
  const rawAssetCount = account?.balancesCount ?? "0";
  const assetCount =
    typeof rawAssetCount === "string"
      ? rawAssetCount
      : rawAssetCount.toString();

  // Calculate transaction count from account data
  const transactionCount = 0;

  return safeParse(CalculatedUserSchema, {
    assetCount, // Now guaranteed to be a string
    transactionCount,
  });
}
