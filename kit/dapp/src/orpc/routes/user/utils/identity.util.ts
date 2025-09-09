import type { Context } from "@/orpc/context/context";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { call, ORPCError } from "@orpc/server";

export interface FetchUserIdentityOptions {
  wallet: `0x${string}`;
  context: Context;
}

export interface UserIdentityResult {
  identity: string | undefined;
  claims: string[];
  isRegistered: boolean;
}

/**
 * Fetches blockchain identity data for a user by their wallet address.
 *
 * This function handles the common pattern of fetching identity data from TheGraph
 * and gracefully handling cases where users don't have an on-chain identity yet.
 *
 * **Error Handling Strategy:**
 * - 404 errors are treated as normal business logic (user has no identity yet)
 * - Other errors are re-thrown as they indicate technical issues
 * - Returns consistent structure in both success and "no identity" cases
 *
 * **Why we return empty results instead of throwing for 404s:**
 * 1. **Expected scenario**: Many users exist in database but haven't set up blockchain identity
 * 2. **UI requirements**: Application needs to display these users with clear "not registered" state
 * 3. **Performance**: Avoids exception handling in normal application flow
 * 4. **Consistency**: All callers get predictable result structure they can safely process
 * 5. **Type safety**: TypeScript enforces proper handling of undefined identity
 *
 * @param options - Configuration including wallet address and request context
 * @returns Promise resolving to identity result with consistent structure
 * @throws Only for technical errors (network issues, invalid responses, etc.)
 *
 * @example
 * ```typescript
 * // User with blockchain identity
 * const result = await fetchUserIdentity({ wallet: "0x123...", context });
 * // result: { identity: "0xabc...", claims: ["kyc", "aml"], isRegistered: true }
 *
 * // User without blockchain identity (normal case)
 * const result = await fetchUserIdentity({ wallet: "0x456...", context });
 * // result: { identity: undefined, claims: [], isRegistered: false }
 * ```
 */
export async function fetchUserIdentity({
  wallet,
  context,
}: FetchUserIdentityOptions): Promise<UserIdentityResult> {
  try {
    const accountData = await call(readAccount, { wallet }, { context });

    const identity = accountData?.identity;
    const claims = accountData?.claims ?? [];

    return {
      identity,
      claims,
      isRegistered: !!identity,
    };
  } catch (error: unknown) {
    // 404 from TheGraph means user has no on-chain identity yet
    // This is expected business logic, not an error condition
    if (error instanceof ORPCError && error.status === 404) {
      return {
        identity: undefined,
        claims: [],
        isRegistered: false,
      };
    }
    
    // Re-throw technical errors (network issues, invalid responses, etc.)
    throw error;
  }
}

/**
 * Creates a consistent identity result for users who don't have a wallet address.
 *
 * This is a convenience function that provides the same result structure as
 * `fetchUserIdentity` for users without wallets, ensuring consistent handling
 * across all identity-related code paths.
 *
 * @returns UserIdentityResult indicating no identity, claims, or registration
 *
 * @example
 * ```typescript
 * if (!user.wallet) {
 *   const identityResult = createNullWalletIdentityResult();
 *   // identityResult: { identity: undefined, claims: [], isRegistered: false }
 * }
 * ```
 */
export function createNullWalletIdentityResult(): UserIdentityResult {
  return {
    identity: undefined,
    claims: [],
    isRegistered: false,
  };
}
