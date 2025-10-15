import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { Context } from "@/orpc/context/context";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import type { IdentityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { call, ORPCError } from "@orpc/server";
import * as z from "zod";

export interface FetchUserIdentityOptions {
  wallet: `0x${string}`;
  context: Context;
}

export interface UserIdentityResult {
  identity: string | undefined;
  claims: IdentityClaim[];
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
    const identityData = await call(
      identityRead,
      { wallet: wallet },
      { context }
    );

    if (!identityData) {
      return {
        identity: undefined,
        claims: [],
        isRegistered: false,
      };
    }

    const identity = identityData.id;
    const claims = identityData.claims ?? [];

    return {
      identity,
      claims,
      isRegistered: identityData.registered
        ? identityData.registered.isRegistered
        : false,
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
 * Extracts the original claimId from a composite subgraph ID.
 *
 * The subgraph stores IdentityClaim IDs as a composite of identityId + claimId:
 * - identityId: 20 bytes (40 hex characters)
 * - claimId: 32 bytes (64 hex characters)
 * - Total composite ID: 52 bytes (104 hex characters)
 *
 * Smart contracts expect only the original 32-byte claimId, so this function
 * extracts the last 64 hex characters from the composite ID.
 *
 * @param compositeClaimId - The composite claim ID from TheGraph subgraph
 * @returns The original 32-byte claimId suitable for smart contract calls
 *
 * @example
 * ```typescript
 * // Input: composite ID from subgraph
 * const subgraphId = "0x2119e8f05c5aa8f4db0994617aa823b7fe681b2c0b7989988539f5b90672066d7466c45df9faa3d1de73e0b7649a5e463175b6e3";
 *
 * // Output: original claimId for smart contract
 * const claimId = extractClaimIdFromComposite(subgraphId);
 * // "0x0b7989988539f5b90672066d7466c45df9faa3d1de73e0b7649a5e463175b6e3"
 * ```
 */
function extractClaimIdFromComposite(compositeClaimId: string): string {
  // Extract the last 64 hex characters (32 bytes) from the composite ID
  const extractedClaimId = compositeClaimId.startsWith("0x")
    ? `0x${compositeClaimId.slice(-64)}` // Take last 64 hex chars and add 0x prefix
    : compositeClaimId.slice(-64); // Take last 64 hex chars

  return extractedClaimId;
}

/**
 * TheGraph GraphQL query for fetching claim data by topic and identity.
 */
const GET_CLAIM_BY_TOPIC_AND_IDENTITY_QUERY = theGraphGraphql(`
  query GetClaimByTopicAndIdentity($claimTopic: String!, $identityAddress: String!) {
    identityClaims(where: {
      name: $claimTopic,
      identity: $identityAddress,
      revoked: false
    }) {
      id
      name
      issuer { id }
      identity { id }
      revoked
    }
  }
`);

/**
 * Response schema for the claim lookup query
 */
const ClaimLookupResponseSchema = z.object({
  identityClaims: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.object({
        id: ethereumAddress,
      }),
      identity: z.object({
        id: ethereumAddress,
      }),
      revoked: z.boolean(),
    })
  ),
});

/**
 * Type for a single identity claim returned by TheGraph
 */
export type IdentityClaimData = z.infer<
  typeof ClaimLookupResponseSchema
>["identityClaims"][0];

/**
 * Options for fetching claims by topic and identity
 */
export interface FetchClaimByTopicOptions {
  claimTopic: string;
  identityAddress: string;
  context: Context;
  errors: Parameters<
    Parameters<
      typeof import("@/orpc/procedures/base.router").baseRouter.middleware
    >[0]
  >[0]["errors"];
}

/**
 * Result of fetching a claim by topic and identity
 */
export interface ClaimLookupResult {
  claim: IdentityClaimData;
  extractedClaimId: string;
}

/**
 * Fetches a single active claim by topic and target identity address.
 *
 * This utility consolidates the common pattern of:
 * 1. Querying TheGraph for claims by topic and identity
 * 2. Validating exactly one claim exists
 * 3. Extracting the smart contract-compatible claimId
 *
 * **Use Cases:**
 * - Claim revocation: Find claim to revoke by topic
 * - Claim verification: Check if specific claim exists
 * - Claim management: Operations requiring exact claim identification
 *
 * **Error Handling:**
 * - NOT_FOUND: No active claims found for the topic/identity combination
 * - BAD_REQUEST: Multiple active claims found (data inconsistency)
 * - INTERNAL_SERVER_ERROR: Unexpected data state after validation
 *
 * @param options - Configuration with claim topic, identity address, and context
 * @returns Promise resolving to claim data and extracted claimId
 * @throws ORPCError with appropriate status codes for various error conditions
 *
 * @example
 * ```typescript
 * // Find collateral claim for revocation
 * const { claim, extractedClaimId } = await fetchClaimByTopicAndIdentity({
 *   claimTopic: "collateral",
 *   identityAddress: "0x1234567890123456789012345678901234567890",
 *   context
 * });
 *
 * // Use extractedClaimId for smart contract calls
 * await revokeClaimOnChain(extractedClaimId);
 * ```
 */
export async function fetchClaimByTopicAndIdentity({
  claimTopic,
  identityAddress,
  context,
  errors,
}: FetchClaimByTopicOptions): Promise<ClaimLookupResult> {
  // Query TheGraph to get claim information by topic and identity
  if (!context.theGraphClient) {
    throw errors.INTERNAL_SERVER_ERROR({
      message:
        "theGraphMiddleware must run before identity utilities can query TheGraph",
    });
  }

  const claimData = await context.theGraphClient.query(
    GET_CLAIM_BY_TOPIC_AND_IDENTITY_QUERY,
    {
      input: {
        claimTopic,
        identityAddress: identityAddress.toLowerCase(),
      },
      output: ClaimLookupResponseSchema,
    }
  );

  // claimData is guaranteed by validated client + schema

  // Check if any claims exist
  if (!claimData.identityClaims || claimData.identityClaims.length === 0) {
    throw errors.NOT_FOUND();
  }

  // Check for multiple active claims (shouldn't happen, but handle gracefully)
  if (claimData.identityClaims.length > 1) {
    throw errors.BAD_REQUEST({
      message: `Multiple active claims found for topic '${claimTopic}' on identity ${identityAddress}`,
      data: {
        claimIds: claimData.identityClaims.map((c) => c.id),
      },
    });
  }

  const claim = claimData.identityClaims[0];
  if (!claim) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "Unexpected: claim missing after validation",
    });
  }

  // Extract the original claimId from the composite subgraph ID
  const extractedClaimId = extractClaimIdFromComposite(claim.id);

  return {
    claim,
    extractedClaimId,
  };
}
