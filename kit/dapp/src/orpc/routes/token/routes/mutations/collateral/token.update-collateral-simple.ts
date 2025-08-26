/**
 * Token Collateral Management Handler with Automatic Trusted Issuer Registration
 *
 * @fileoverview
 * Implements collateral claim management for token supply backing through the ERC-735
 * claim standard. This system enables authorized entities to update collateral amounts
 * by issuing cryptographic claims on OnchainID contracts.
 *
 * Key architectural decisions:
 * - Automatic trusted issuer registration: Reduces friction by eliminating manual setup
 * - Self-issued claims via CONTRACT scheme: Allows identity contracts to issue their own collateral claims
 * - Fallback error handling: Continues operation even if trusted issuer registration fails
 * - Built-in claim expiry: Ensures collateral claims require periodic renewal for freshness
 *
 * Security model:
 * - Requires TOKEN_PERMISSIONS.updateCollateral role for authorization
 * - Uses wallet verification (2FA/biometric) for sensitive operations
 * - Validates trusted issuer status before claim issuance
 * - Leverages ERC-735 cryptographic signatures for claim integrity
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { encodeAbiParameters, encodePacked, keccak256 } from "viem";
import { z } from "zod";

/**
 * Schema for trusted issuer query response from the TrustedIssuersRegistry contract.
 *
 * WHY: Runtime validation ensures GraphQL responses match expected structure,
 * preventing silent failures when registry contract behavior changes.
 */
const TrustedIssuerQuerySchema = z.object({
  IATKTrustedIssuersRegistry: z.object({
    isTrustedIssuer: z.boolean(),
    getTrustedIssuerClaimTopics: z.array(z.string()),
  }),
});

/**
 * GraphQL query to check if an identity contract is registered as a trusted issuer.
 *
 * ARCHITECTURE: Uses SettleMint Portal's GraphQL layer to interact with blockchain state,
 * avoiding direct RPC calls for better caching and error handling.
 */
const CHECK_TRUSTED_ISSUER_QUERY = portalGraphql(`
  query CheckTrustedIssuer($registryAddress: String!, $issuer: String!) {
    IATKTrustedIssuersRegistry(address: $registryAddress) {
      isTrustedIssuer(_issuer: $issuer)
      getTrustedIssuerClaimTopics(_trustedIssuer: $issuer)
    }
  }
`);

/**
 * GraphQL mutation to automatically register an identity contract as a trusted issuer.
 *
 * WHY AUTOMATIC: Manual trusted issuer setup creates friction and potential for user error.
 * By automatically registering identity contracts as trusted issuers for collateral claims,
 * we enable seamless self-issued claim workflows while maintaining security boundaries.
 *
 * SECURITY: Requires wallet verification to prevent unauthorized issuer registration.
 * Only users with appropriate permissions can trigger this registration process.
 */
const ADD_TRUSTED_ISSUER_MUTATION = portalGraphql(`
  mutation AddTrustedIssuer(
    $address: String!
    $from: String!
    $trustedIssuer: String!
    $claimTopics: [String!]!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTrustedIssuersRegistryAddTrustedIssuer(
      address: $address
      from: $from
      input: {
        _trustedIssuer: $trustedIssuer
        _claimTopics: $claimTopics
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for issuing ERC-735 collateral claims on identity contracts.
 *
 * ERC-735 CONTEXT: This follows the ERC-735 Claim Holder standard, where claims
 * are structured attestations with:
 * - topic: Identifies the claim type (collateral = topic 1)
 * - scheme: Signature verification method (CONTRACT = scheme 3)
 * - issuer: Entity making the claim (identity contract itself for self-issued claims)
 * - signature: Cryptographic proof of claim validity
 * - data: ABI-encoded claim payload (amount + expiry)
 * - uri: Optional external reference (unused for on-chain collateral)
 *
 * CONTRACT SCHEME: Uses scheme 3 (CONTRACT) where the identity contract acts as
 * both issuer and validator, enabling self-issued claims without external signatures.
 */
const COLLATERAL_CLAIM_MUTATION = portalGraphql(`
  mutation AddCollateralClaim(
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
 * Updates collateral backing for a tokenized asset through ERC-735 claim issuance.
 *
 * This function implements a sophisticated collateral management system that:
 * 1. Automatically registers identity contracts as trusted issuers (reducing friction)
 * 2. Issues cryptographically verifiable collateral claims using ERC-735 standard
 * 3. Handles expiry management to ensure collateral claims remain fresh
 * 4. Provides fallback behavior when automatic registration fails
 *
 * DESIGN RATIONALE:
 * - Self-issued claims: Identity contracts issue their own collateral claims via CONTRACT scheme,
 *   eliminating dependency on external claim issuers while maintaining cryptographic integrity
 * - Automatic trusted issuer registration: Prevents workflow interruption from manual setup requirements
 * - Claim expiry enforcement: Ensures collateral attestations don't become stale indefinitely
 * - Graceful degradation: Continues with claim issuance even if trusted issuer registration fails
 *
 * SECURITY CONSIDERATIONS:
 * - Requires TOKEN_PERMISSIONS.updateCollateral authorization
 * - Validates wallet ownership through 2FA/biometric verification
 * - Uses cryptographic message hashing for claim signature verification
 * - Leverages trusted issuer registry to control claim acceptance
 *
 * PERFORMANCE TRADE-OFFS:
 * - 2-second delay after trusted issuer registration allows blockchain state consistency
 * - GraphQL queries provide cached access but may have slight indexing delays
 * - Automatic registration adds latency but eliminates manual configuration steps
 *
 * @param input - Collateral update parameters
 * @param input.contract - Token contract address requiring collateral backing
 * @param input.amount - Collateral amount to attest (in token's base units)
 * @param input.expiryDays - Days until collateral claim expires (forces renewal)
 * @param input.walletVerification - 2FA/biometric verification for transaction authorization
 * @param context - Request context with authentication and system configuration
 * @param context.auth.user - Authenticated user initiating the collateral update
 * @param context.system.trustedIssuersRegistry - Registry contract for managing trusted claim issuers
 * @param context.portalClient - SettleMint Portal client for blockchain interactions
 * @returns Updated token data with refreshed collateral information
 * @throws {Error} When token lacks associated identity contract
 * @throws {Error} When required permissions are missing
 * @throws {Error} When wallet verification fails
 */
export const updateCollateral = tokenRouter.token.updateCollateral
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, amount, expiryDays, walletVerification } = input;
    const { auth, system, portalClient } = context;

    // AUTHORIZATION: Extract authenticated user for blockchain transaction signing
    const sender = auth.user;

    // EXPIRY MANAGEMENT: Convert human-readable days to blockchain timestamp
    // WHY: ERC-735 claims require explicit expiry to prevent indefinite stale attestations
    const expiryTimestamp =
      Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

    // IDENTITY RESOLUTION: Extract OnchainID contract from token's account structure
    // ARCHITECTURE: Each token has an associated identity contract for claim management
    const tokenData = context.token;
    const onchainID = tokenData.account.identity?.id;

    if (!onchainID) {
      throw new Error(
        `Token at address ${contract} does not have an associated identity contract`
      );
    }

    // ERC-735 CLAIM TOPIC: Topic 1 represents collateral claims by convention
    // WHY PADDING: Ethereum addresses and topics are 32-byte values, padding ensures proper encoding
    const claimTopic = "0x" + "1".padStart(64, "0");
    // DUAL FORMAT: Registry expects decimal string, claim contract expects hex bytes32
    const claimTopicDecimal = "1";

    // AUTOMATIC TRUSTED ISSUER REGISTRATION: Core UX improvement to eliminate manual setup
    const registryAddress = system?.trustedIssuersRegistry;

    if (registryAddress) {
      try {
        // VALIDATION: Check current trusted issuer status before attempting registration
        // WHY: Avoid unnecessary blockchain transactions if already properly configured
        const checkResult = await portalClient.query(
          CHECK_TRUSTED_ISSUER_QUERY,
          {
            registryAddress,
            issuer: onchainID,
          },
          TrustedIssuerQuerySchema
        );

        const isTrusted =
          checkResult.IATKTrustedIssuersRegistry.isTrustedIssuer;
        const topics =
          checkResult.IATKTrustedIssuersRegistry.getTrustedIssuerClaimTopics;
        const hasCollateralTopic = topics.includes(claimTopicDecimal);

        // CONDITIONAL REGISTRATION: Only register if not already trusted for collateral claims
        if (!isTrusted || !hasCollateralTopic) {
          // AUTOMATIC REGISTRATION: Eliminates manual trusted issuer setup friction
          // SECURITY: Uses same wallet verification as main collateral claim
          const addIssuerResult = await portalClient.mutate(
            ADD_TRUSTED_ISSUER_MUTATION,
            {
              address: registryAddress,
              from: sender.wallet,
              trustedIssuer: onchainID,
              claimTopics: [claimTopicDecimal],
            },
            {
              sender,
              code: walletVerification.secretVerificationCode,
              type: walletVerification.verificationType,
            }
          );

          // BLOCKCHAIN CONSISTENCY: Allow time for transaction to be mined and indexed
          // TRADEOFF: 2-second delay improves reliability at cost of perceived latency
          if (addIssuerResult) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        // GRACEFUL DEGRADATION: Continue with claim issuance even if auto-registration fails
        // WHY: Some deployments may have different security policies requiring manual issuer setup
        // LOGGING: Warn about auto-registration failure without blocking the workflow
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(
            "Failed to automatically register trusted issuer - user may need to manually add trusted issuer:",
            error
          );
        }
        // FALLBACK: Proceed with collateral claim - manual trusted issuer setup may resolve issue
      }
    }

    // ERC-735 CLAIM DATA ENCODING: Structure collateral information for blockchain storage
    // WHY ABI ENCODING: Ensures consistent data format for contract consumption and verification
    const claimData = encodeAbiParameters(
      [
        { name: "amount", type: "uint256" },
        { name: "expiryTimestamp", type: "uint256" },
      ],
      [BigInt(amount.toString()), BigInt(expiryTimestamp)]
    );

    // CONTRACT SCHEME SIGNATURE: Generate cryptographic proof for self-issued claim
    // ERC-735 SCHEME 3: Identity contract validates its own claims using this message hash
    // SECURITY: Prevents claim tampering by binding signature to issuer, topic, and data
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "bytes"],
        [onchainID, BigInt(claimTopic), claimData]
      )
    );

    // COLLATERAL CLAIM ISSUANCE: Submit ERC-735 claim to identity contract
    await context.portalClient.mutate(
      COLLATERAL_CLAIM_MUTATION,
      {
        address: onchainID,
        from: sender.wallet,
        topic: claimTopic,
        scheme: "3", // ERC-735 CONTRACT scheme: self-issued claims with contract validation
        issuer: onchainID, // SELF-ISSUED: Identity contract issues claim about itself
        signature: messageHash, // Cryptographic proof linking claim to issuer and data
        data: claimData, // ABI-encoded collateral amount and expiry timestamp
        uri: "", // No external reference needed for on-chain collateral data
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // INDEXING DELAY NOTICE: TheGraph subgraph requires 30-60 seconds for claim indexing
    // TROUBLESHOOTING: If collateral value remains 0, verify trusted issuer registration
    // WHY ASYNC: Blockchain finality and subgraph indexing operate independently

    // RESPONSE: Return refreshed token data with updated collateral information
    // NOTE: May not immediately reflect new collateral due to indexing delays
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
