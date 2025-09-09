import { portalGraphql } from "@/lib/settlemint/portal";
import { createClaim, type ClaimInfo } from "@/orpc/helpers/create-claim";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import {
  canWriteClaims,
  identityPermissionsMiddleware,
} from "@/orpc/middlewares/auth/identity-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getAddress } from "viem";
import {
  type ClaimData,
  type ClaimsIssueInputSchema,
} from "./claims.issue.schema";

/**
 * Portal GraphQL mutation for adding claims to identity contracts.
 */
const ADD_CLAIM_MUTATION = portalGraphql(`
  mutation AddIdentityClaim(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $topic: String!
    $scheme: String!
    $issuer: String!
    $signature: String!
    $data: String!
    $uri: String!
  ) {
    addClaim: ATKContractIdentityImplementationAddClaim(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _topic: $topic
        _scheme: $scheme
        _issuer: $issuer
        _signature: $signature
        _data: $data
        _uri: $uri
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Configuration mapping for claim type field conversions.
 * Defines which fields need type conversion for each claim type.
 */
const CLAIM_TYPE_CONVERSIONS: Record<
  string,
  Record<string, "bigint" | "string" | "boolean" | "number">
> = {
  collateral: {
    amount: "bigint",
    expiryTimestamp: "bigint",
  },
  basePrice: {
    amount: "bigint",
    currencyCode: "string",
    decimals: "number",
  },
  issuerLicensed: {
    licenseType: "string",
    licenseNumber: "string",
    jurisdiction: "string",
    validUntil: "bigint",
  },
  issuerReportingCompliant: {
    compliant: "boolean",
    lastUpdated: "bigint",
  },
};

/**
 * Converts API claim data (strings) to internal claim format (proper types).
 *
 * This function handles the type conversion between JSON-safe API inputs and
 * blockchain-ready internal types. Large numbers come as strings from JSON
 * but need to be bigint for ABI encoding.
 *
 * @param apiClaim - Claim data from API with string-based numeric values
 * @returns ClaimInfo with properly typed values for blockchain operations
 *
 * @example
 * ```typescript
 * const apiClaim = {
 *   topic: "collateral",
 *   data: { amount: "1000", expiryTimestamp: "1735689600" }
 * };
 *
 * const internalClaim = convertApiClaimToInternal(apiClaim);
 * // Returns: {
 * //   topic: "collateral",
 * //   data: { amount: 1000n, expiryTimestamp: 1735689600n }
 * // }
 * ```
 */
function convertApiClaimToInternal(apiClaim: ClaimData): ClaimInfo {
  const { topic, data } = apiClaim;

  // Get conversion rules for this claim type
  const conversions = CLAIM_TYPE_CONVERSIONS[topic];

  // If no conversions needed, return as-is
  if (!conversions) {
    return { topic, data } as ClaimInfo;
  }

  // Apply type conversions
  const convertedData = { ...data } as Record<
    string,
    string | bigint | number | boolean
  >;

  for (const [fieldName, targetType] of Object.entries(conversions)) {
    if (fieldName in convertedData) {
      const value = convertedData[fieldName];

      if (value !== undefined) {
        switch (targetType) {
          case "bigint":
            convertedData[fieldName] = BigInt(value);
            break;
          case "number":
            convertedData[fieldName] = Number(value);
            break;
          case "boolean":
            convertedData[fieldName] = Boolean(value);
            break;
          default:
            break;
        }
      }
    }
  }

  return { topic, data: convertedData } as ClaimInfo;
}

/**
 * Claims issue route handler.
 *
 * Issues a new claim to a user's on-chain identity. This endpoint
 * creates and signs a blockchain claim that gets added to the
 * target identity contract.
 *
 * **Key Requirements:**
 * - ✅ User must have claimIssuer role (validated by blockchainPermissionsMiddleware)
 * - ✅ User must be a trusted issuer for the claim topic (validated in handler)
 * - ✅ Target must be a valid identity contract address
 * - ✅ Issuer must provide valid wallet verification
 *
 * **Blockchain Interaction:**
 * - Creates signed claim using Portal API
 * - Claim gets added to target's identity contract
 * - Transaction is recorded on blockchain
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "claimIssuer" role and trusted issuer status for the specific claim topic
 * Method: POST /user/claims/issue
 *
 * @param input - Issue parameters with target identity address, claim data, and verification
 * @param context - Request context with auth info and services
 * @returns Promise<ClaimsIssueOutput> - Success status and transaction details
 * @throws UNAUTHORIZED - If user is not authenticated or lacks issuer identity
 * @throws FORBIDDEN - If user is not a trusted issuer for the claim topic
 * @throws INTERNAL_SERVER_ERROR - If claim creation or blockchain interaction fails
 *
 * @example
 * ```typescript
 * // Issue KYC claim
 * const result = await orpc.user.claims.issue.mutate({
 *   targetIdentityAddress: "0x123...",
 *   claim: {
 *     topic: "knowYourCustomer",
 *     data: { claim: "verified" }
 *   },
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Issue collateral claim
 * const result = await orpc.user.claims.issue.mutate({
 *   targetIdentityAddress: "0x456...",
 *   claim: {
 *     topic: "collateral",
 *     data: {
 *       amount: "1000000000000000000", // 1 ETH in wei
 *       expiryTimestamp: "1735689600" // Unix timestamp
 *     }
 *   },
 *   walletVerification: {
 *     verificationType: "otp",
 *     secretVerificationCode: "123456"
 *   }
 * });
 * ```
 */
export const issue = authRouter.user.claims.issue
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimIssuer"] },
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(trustedIssuerMiddleware)
  .use(
    identityPermissionsMiddleware<typeof ClaimsIssueInputSchema>({
      getTargetUserId: () => undefined, // No specific user data access needed for claim issuance
    })
  )
  .handler(async ({ context, input, errors }) => {
    const { targetIdentityAddress, claim, walletVerification } = input;

    // Ensure user has an issuer identity
    if (!context.userIssuerIdentity) {
      throw errors.UNAUTHORIZED({
        message: "User does not have an issuer identity",
      });
    }

    // Verify issuer can issue this specific claim topic
    // The identityPermissionsMiddleware computes comprehensive permissions combining
    // blockchain roles and trusted issuer status
    if (!canWriteClaims([claim.topic], context.identityPermissions)) {
      throw errors.FORBIDDEN({
        message: `You are not authorized to issue claims for topic: ${claim.topic}`,
        data: {
          requestedTopic: claim.topic,
          authorizedTopics: context.identityPermissions.claims.write,
        },
      });
    }

    // Convert API claim data to internal format
    const claimInfo = convertApiClaimToInternal(claim);

    // Create and sign the claim
    const { signature, topicId, claimData } = await createClaim({
      user: context.auth.user,
      walletVerification,
      identity: getAddress(targetIdentityAddress),
      claim: claimInfo,
    });

    // Submit claim to blockchain via Portal
    const result = await context.portalClient.mutate(
      ADD_CLAIM_MUTATION,
      {
        address: getAddress(targetIdentityAddress),
        from: context.auth.user.wallet,
        topic: topicId.toString(),
        scheme: "1", // ECDSA scheme
        issuer: context.userIssuerIdentity,
        signature,
        data: claimData,
        uri: "", // Optional URI for additional metadata
      },
      {
        sender: context.auth.user,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return {
      success: true,
      transactionHash: result,
      claimTopic: claim.topic,
      targetWallet: targetIdentityAddress,
    };
  });
