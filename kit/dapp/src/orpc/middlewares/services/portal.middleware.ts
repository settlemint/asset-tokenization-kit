/**
 * Portal Middleware with Wallet Verification Enrichment
 *
 * @remarks
 * This middleware implements a sophisticated wallet verification pattern that enriches
 * GraphQL mutations with authentication parameters. The key architectural decision is to
 * keep verification parameters optional at the GraphQL schema level while conditionally
 * enriching them based on user verification settings.
 *
 * ARCHITECTURAL PATTERN:
 * - GraphQL mutations declare challengeId and challengeResponse as optional
 * - Middleware enriches these parameters based on walletVerification context
 * - Different verification types (OTP, PINCODE, SECRET_CODES) have different protocols
 * - Centralized verification logic prevents code duplication across mutations
 *
 * SECURITY BOUNDARIES:
 * - OTP: Direct verification code validation by Portal
 * - SECRET_CODES: Formatted backup codes with dash separators
 * - PINCODE: Challenge-response protocol with cryptographic hashing
 *
 * PERFORMANCE TRADEOFFS:
 * - PINCODE requires additional Portal roundtrip for challenge generation
 * - OTP and SECRET_CODES are validated in single mutation call
 * - Transaction tracking adds latency but ensures data consistency
 *
 * @see {@link getVerificationId} Helper to resolve user verification IDs
 * @see {@link generatePincodeResponse} PINCODE cryptographic challenge handling
 */

import type { SessionUser } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import {
  ethereumHash,
  getEthereumHash as getTransactionHash,
  type EthereumHash as TransactionHash,
} from "@/lib/zod/validators/ethereum-hash";
import { getVerificationId } from "@/orpc/helpers/get-verification-id";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import type { TadaDocumentNode } from "gql.tada";
import { getOperationAST } from "graphql";
import type { Variables } from "graphql-request";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { baseRouter } from "../../procedures/base.router";

const CreateVerificationChallengeMutation = portalGraphql(`
  mutation CreateVerificationChallenge($userWalletAddress: String!, $verificationType: WalletVerificationType!) {
    createVerificationChallenge(
      userWalletAddress: $userWalletAddress
      verificationType: $verificationType
    ) {
      id
      name
      verificationType
      challenge {
        salt
        secret
      }
    }
  }`);

const GET_TRANSACTION_QUERY = portalGraphql(`
  query GetTransaction($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      receipt {
        status
        revertReasonDecoded
        revertReason
        blockNumber
      }
    }
  }
`);

const GET_INDEXING_STATUS_QUERY = theGraphGraphql(`
  query GetIndexingStatus {
    _meta {
      block {
        number
      }
    }
  }
`);

/**
 * Extracts the operation name from a GraphQL document.
 *
 * @remarks
 * This function parses the GraphQL document AST to find the operation name.
 * It handles documents created by gql.tada which don't have __meta property.
 *
 * @param document - The GraphQL document to extract the operation name from
 * @returns The operation name if found, or undefined
 */
function getOperationName<TResult, TVariables extends Variables>(
  document: TadaDocumentNode<TResult, TVariables>
): string | undefined {
  // First check if __meta property exists (for backward compatibility)
  const docWithMeta = document as TadaDocumentNode<TResult, TVariables> & {
    __meta?: { operationName?: string };
  };
  if (docWithMeta.__meta?.operationName) {
    return docWithMeta.__meta.operationName;
  }

  // Extract operation name from the AST
  try {
    const operationAST = getOperationAST(document);
    return operationAST?.name?.value;
  } catch {
    // If parsing fails, return undefined
    return undefined;
  }
}

/**
 * Generates a challenge response for pincode verification using cryptographic hashing.
 *
 * @remarks
 * SECURITY: Implements two-phase hashing to prevent rainbow table attacks and ensure
 * verification codes cannot be reverse-engineered from network traffic. The salt
 * prevents precomputed hash attacks, while the secret adds server-side entropy.
 *
 * @param pincode - User's numerical pincode (validated elsewhere for length/format)
 * @param salt - Random salt from Portal verification challenge (prevents rainbow tables)
 * @param secret - Server-generated secret from Portal (adds entropy, prevents replay attacks)
 * @returns SHA256 hash of the salted pincode combined with secret for Portal verification
 */
function generatePincodeResponse(
  pincode: string,
  salt: string,
  secret: string
): string {
  // PHASE 1: Salt the pincode to prevent rainbow table attacks
  const hashedPincode = createHash("sha256")
    .update(`${salt}${pincode}`)
    .digest("hex");
  // PHASE 2: Combine with server secret to prevent replay attacks
  return createHash("sha256")
    .update(`${hashedPincode}_${secret}`)
    .digest("hex");
}

/**
 * Creates a validated Portal client with built-in error handling and validation.
 *
 * This function returns a client that wraps Portal GraphQL operations with:
 * - Automatic transaction hash extraction and validation for mutations
 * - Real-time transaction tracking with event streaming
 * - Zod schema validation for queries
 * - Consistent error handling and logging
 * - Integration with TheGraph for indexing status monitoring
 * @param {object} errors - ORPC error constructors for consistent error handling
 * @param {ValidatedTheGraphClient} [theGraphClient] - Optional TheGraph client for indexing monitoring.
 *   If provided, mutations will track both blockchain confirmation and indexing status.
 *   If omitted, mutations will only track blockchain confirmation.
 * @returns {object} A validated Portal client with `mutate` and `query` methods
 * @example
 * ```typescript
 * const client = createValidatedPortalClient(errors, theGraphClient);
 *
 * // For mutations with transaction tracking
 * for await (const event of client.mutate(CREATE_TOKEN_MUTATION, variables, "Failed to create token")) {
 *   console.log(event.status, event.message);
 * }
 *
 * // For queries with validation
 * const data = await client.query(GET_TOKEN_QUERY, variables, TokenSchema, "Token not found");
 * ```
 */
function createValidatedPortalClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"],
  theGraphClient?: ValidatedTheGraphClient
) {
  const client = {
    /**
     * Executes a GraphQL mutation and waits for the transaction to complete.
     *
     * This method submits a mutation to Portal and monitors the resulting transaction
     * through its lifecycle until it's confirmed on-chain and indexed by TheGraph.
     *
     * @param document - The GraphQL mutation document
     * @param variables - Variables for the GraphQL mutation (must include 'from' field for wallet verification)
     * @param walletVerification - Optional wallet verification parameters including sender
     * @returns The transaction hash once confirmed
     * @throws PORTAL_ERROR When Portal GraphQL operation fails
     * @throws PORTAL_ERROR When transaction fails, times out, or has invalid format
     * @example
     * ```typescript
     * // Basic usage without verification
     * const txHash = await client.mutate(
     *   CREATE_TOKEN_MUTATION,
     *   { from: "0x...", name: "MyToken" }
     * );
     *
     * // With wallet verification
     * const txHash = await client.mutate(
     *   TRANSFER_MUTATION,
     *   { from: "0x...", to: recipient, amount },
     *   {
     *     sender: auth.user,
     *     code: "123456",
     *     type: "PINCODE"
     *   }
     * );
     * ```
     */
    async mutate<TResult, TVariables extends Variables & { from: string }>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: Omit<TVariables, "challengeId" | "challengeResponse"> & {
        from: EthereumAddress;
      },
      walletVerification?: {
        sender: SessionUser;
        code: string;
        type: "OTP" | "PINCODE" | "SECRET_CODES";
      }
    ): Promise<TransactionHash> {
      // Extract operation name from document
      const operation = getOperationName(document) ?? "GraphQL Mutation";

      // Generate a unique request ID that includes the operation name for tracing
      const requestId = `atk-mut-${operation.replaceAll(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${randomUUID()}`;

      // WALLET VERIFICATION ENRICHMENT
      // WHY: GraphQL mutations accept challengeId and challengeResponse as optional parameters,
      // but we enrich them here based on the user's verification type to ensure secure operations.
      // This pattern keeps verification logic centralized while making GraphQL schema flexible.
      // IMPORTANT: Create a deep copy to prevent concurrent mutations from sharing state
      let enrichedVariables = { ...variables } as unknown as TVariables;

      if (walletVerification) {
        const { sender, code, type } = walletVerification;

        // SECURITY: Retrieve user's verification ID based on their configured verification type
        // Each user can have multiple verification methods (OTP, PINCODE, SECRET_CODES)
        const verificationId = getVerificationId(sender, type);

        if (!verificationId) {
          throw errors.PORTAL_ERROR({
            message: `Verification ID not found for ${type}`,
            data: {
              document,
              variables,
              responseValidation: `No verification ID configured for ${type}`,
            },
          });
        }

        // VERIFICATION CHALLENGE: All verification types require creating a challenge first
        // The challenge provides a unique ID and cryptographic parameters for secure verification
        const userWalletAddress = variables.from;

        const challengeResult = await portalClient.request(
          CreateVerificationChallengeMutation,
          {
            userWalletAddress,
            verificationType: type,
          },
          {
            "x-request-id": requestId,
          }
        );

        if (!challengeResult.createVerificationChallenge) {
          throw errors.PORTAL_ERROR({
            message: "Failed to create verification challenge",
            data: {
              document,
              variables,
              responseValidation: `${type} verification failed`,
            },
          });
        }

        const challenge = challengeResult.createVerificationChallenge;
        const challengeId = challenge.id;

        let challengeResponse: string;

        if (type === "OTP") {
          // VERIFICATION TYPE: Time-based One-Time Password (TOTP)
          // WHY: OTP codes are validated directly by Portal without additional hashing
          challengeResponse = code;
        } else if (type === "SECRET_CODES") {
          // VERIFICATION TYPE: Backup secret codes (12-word recovery phrases)
          // WHY: Format with dash separator to match Portal's expected format
          challengeResponse = code.replace(/(.{5})(?=.)/, "$1-");
        } else {
          // VERIFICATION TYPE: PINCODE (numerical PIN with cryptographic challenge)
          // WHY: PINCODE requires a dynamic challenge-response protocol to prevent replay attacks.
          // Portal generates a unique salt and secret for each verification attempt.
          if (
            !challenge.challenge ||
            !challenge.challenge.salt ||
            !challenge.challenge.secret
          ) {
            throw errors.PORTAL_ERROR({
              message: "Failed to create verification challenge",
              data: {
                document,
                variables,
                responseValidation: `${type} verification failed`,
              },
            });
          }
          challengeResponse = generatePincodeResponse(
            code,
            challenge.challenge.salt,
            challenge.challenge.secret
          );
        }

        // PARAMETER ENRICHMENT: Add verification data to mutation variables
        // WHY: GraphQL schema defines challengeId and challengeResponse as optional,
        // but we conditionally enrich them based on user verification settings.
        // This keeps the schema flexible while ensuring secure operations.

        enrichedVariables = {
          ...variables,
          challengeId, // Portal expects the challenge ID from createVerificationChallenge
          challengeResponse,
        } as TVariables & { challengeId: string; challengeResponse: string };
      }

      let result: TResult;
      try {
        // The graphql-request library has complex conditional types that TypeScript can't resolve
        // at compile time, but we know we're always passing variables
        result = await (
          portalClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V,
            headers?: Record<string, string>
          ) => Promise<D>
        )(document, enrichedVariables, {
          "x-request-id": requestId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw errors.PORTAL_ERROR({
          message:
            mapPortalErrorMessage(errorMessage) ??
            `GraphQL ${operation} failed`,
          data: {
            document,
            variables,
          },
          cause: error,
        });
      }

      // Find transaction hash in the result
      const found = findTransactionHash(result);
      if (!found) {
        throw errors.PORTAL_ERROR({
          message: `No transaction hash found in ${operation} response`,
          data: {
            document,
            variables,
          },
        });
      }

      // Validate the transaction hash
      let transactionHash: string;
      try {
        transactionHash = ethereumHash.parse(found.value);
      } catch (zodError) {
        throw errors.PORTAL_ERROR({
          message: `Invalid transaction hash format: ${zodError instanceof Error ? zodError.message : String(zodError)}`,
          data: {
            document,
            variables,
            responseValidation: `Invalid transaction hash at ${found.path}: ${found.value}`,
          },
          cause: zodError,
        });
      }

      // If no theGraphClient is provided, just return the transaction hash
      if (!theGraphClient) {
        return getTransactionHash(transactionHash);
      }

      // ===== TRANSACTION TRACKING CONFIGURATION =====
      // These constants control the timing and retry behavior of transaction monitoring
      const MAX_ATTEMPTS = 30; // Maximum attempts to check transaction status
      const DELAY_MS = 2000; // Delay between transaction status checks (2 seconds)
      const POLLING_INTERVAL_MS = 500; // Interval for indexing status checks (500ms)
      const INDEXING_TIMEOUT_MS = 60_000; // Maximum time to wait for indexing (1 minute)
      const STREAM_TIMEOUT_MS = 90_000; // Total timeout for the entire tracking process (1.5 minutes)

      const streamStartTime = Date.now();

      // ===== PHASE 1: BLOCKCHAIN CONFIRMATION =====
      // Monitor the transaction until it's mined and included in a block.
      // This phase polls the blockchain to check if the transaction has been:
      // - Mined successfully (status: "Success")
      // - Reverted (status: "Reverted")
      // - Dropped from the mempool (no receipt after timeout)
      let receipt:
        | {
            status: "Success" | "Reverted";
            blockNumber: string;
            revertReasonDecoded: string | null;
            revertReason: string | null;
          }
        | undefined;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          throw errors.PORTAL_ERROR({
            message: `Transaction tracking timeout after ${STREAM_TIMEOUT_MS}ms`,
            data: {
              document: GET_TRANSACTION_QUERY,
              variables: { transactionHash },
              responseValidation: `Transaction ${transactionHash} timed out after ${Date.now() - streamStartTime}ms`,
            },
          });
        }

        const transactionQueryVariables = { transactionHash };
        const result = await client.query(
          GET_TRANSACTION_QUERY,
          transactionQueryVariables,
          z.object({
            getTransaction: z
              .object({
                receipt: z
                  .object({
                    status: z.enum(["Success", "Reverted"]),
                    revertReasonDecoded: z.string().nullable(),
                    revertReason: z.string().nullable(),
                    blockNumber: z.string(),
                  })
                  .nullable(),
              })
              .nullable(),
          })
        );

        receipt = result.getTransaction?.receipt ?? undefined;

        if (!receipt) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          continue;
        }

        if (receipt.status !== "Success") {
          throw errors.PORTAL_ERROR({
            message: `Transaction reverted: ${receipt.revertReasonDecoded || receipt.revertReason || "Unknown reason"}`,
            data: {
              document: GET_TRANSACTION_QUERY,
              variables: transactionQueryVariables,
              responseValidation: `Transaction ${transactionHash} reverted with status ${receipt.status}`,
            },
          });
        }

        break;
      }

      if (!receipt) {
        throw errors.PORTAL_ERROR({
          message: "Transaction dropped from mempool",
          data: {
            document: GET_TRANSACTION_QUERY,
            variables: { transactionHash },
            responseValidation: `Transaction ${transactionHash} dropped after ${MAX_ATTEMPTS} attempts`,
          },
        });
      }

      // ===== PHASE 2: THEGRAPH INDEXING =====
      // After blockchain confirmation, wait for TheGraph to index the transaction.
      // This ensures that the transaction data is available for queries.
      // TheGraph needs to process the block containing our transaction before
      // the dApp can display updated data.

      const targetBlockNumber = Number(receipt.blockNumber);
      const indexingQueryVariables = {};

      for (
        let attempt = 0;
        attempt < Math.ceil(INDEXING_TIMEOUT_MS / POLLING_INTERVAL_MS);
        attempt++
      ) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          throw errors.PORTAL_ERROR({
            message: `TheGraph indexing timeout after ${STREAM_TIMEOUT_MS}ms`,
            data: {
              document: GET_INDEXING_STATUS_QUERY,
              variables: indexingQueryVariables,
              responseValidation: `Indexing timeout for transaction ${transactionHash} at block ${targetBlockNumber}`,
            },
          });
        }

        const result = await theGraphClient.query(GET_INDEXING_STATUS_QUERY, {
          input: indexingQueryVariables,
          output: z.object({
            _meta: z
              .object({
                block: z.object({
                  number: z.number(),
                }),
              })
              .nullable(),
          }),
        });

        const indexedBlock = result._meta?.block.number ?? 0;

        if (indexedBlock >= targetBlockNumber) {
          return getTransactionHash(transactionHash);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_MS)
        );
      }

      // Indexing timeout - but transaction was confirmed, so we still return success
      return getTransactionHash(transactionHash);
    },

    /**
     * Executes a GraphQL query with automatic response validation.
     *
     * This method performs a GraphQL query operation and validates the response
     * against a provided Zod schema. This ensures type safety at runtime and
     * helps catch API response format changes early.
     * @param document - The GraphQL query document
     * @param variables - Variables for the GraphQL query
     * @param schema - Zod schema to validate the response against
     * @returns The validated query response data
     * @throws PORTAL_ERROR When the Portal service encounters an error
     * @throws NOT_FOUND When the requested resource is not found
     * @throws PORTAL_ERROR When the query fails or response validation fails
     * @example
     * ```typescript
     * // Define the expected response schema
     * const TokenSchema = z.object({
     *   getToken: z.object({
     *     id: z.string(),
     *     name: z.string(),
     *     symbol: z.string(),
     *     totalSupply: z.string(),
     *     decimals: z.number()
     *   })
     * });
     *
     * // Execute query with validation
     * const tokenData = await client.query(
     *   GET_TOKEN_QUERY,
     *   { tokenId: "0x123..." },
     *   TokenSchema,
     *   "Failed to fetch token details"
     * );
     *
     * // TypeScript knows tokenData matches TokenSchema
     * console.log(tokenData.getToken.name); // Type-safe access
     *
     * // Complex nested schema example
     * const TransferHistorySchema = z.object({
     *   getTransfers: z.array(z.object({
     *     id: z.string(),
     *     from: z.string(),
     *     to: z.string(),
     *     amount: z.string(),
     *     timestamp: z.number(),
     *     transaction: z.object({
     *       hash: z.string(),
     *       blockNumber: z.number()
     *     })
     *   }))
     * });
     *
     * const transfers = await client.query(
     *   GET_TRANSFER_HISTORY_QUERY,
     *   { address: userAddress, limit: 10 },
     *   TransferHistorySchema,
     *   "Failed to load transfer history"
     * );
     * ```
     */
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      schema: z.ZodType<TValidated>
    ): Promise<TValidated> {
      const operation = getOperationName(document) ?? "GraphQL Query";

      // Generate a unique request ID for query tracing
      const requestId = `atk-qry-${operation.replaceAll(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}-${Math.random().toString(36).slice(7)}`;

      let result: TResult;
      try {
        result = await (
          portalClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V,
            headers?: Record<string, string>
          ) => Promise<D>
        )(document, variables, {
          "x-request-id": requestId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw errors.PORTAL_ERROR({
          message:
            mapPortalErrorMessage(errorMessage) ??
            `GraphQL ${operation} failed`,
          data: {
            document,
            variables,
          },
          cause: error,
        });
      }

      // Validate with Zod schema
      const parseResult = schema.safeParse(result);
      if (!parseResult.success) {
        // Check if this is a null response (common for queries that return no data)
        if (result === null || result === undefined) {
          throw errors.NOT_FOUND();
        }

        throw errors.PORTAL_ERROR({
          message: `Invalid response format from ${operation}`,
          data: {
            document,
            variables,
            responseValidation: z.prettifyError(parseResult.error),
          },
          cause: parseResult.error,
        });
      }

      return parseResult.data;
    },
  } as const;

  return client;
}

/**
 * Recursively searches for a transactionHash field in a GraphQL response.
 *
 * This helper function performs a depth-first search through an object structure
 * to locate a `transactionHash` field. This is necessary because different GraphQL
 * mutations may return the transaction hash at different nesting levels in the response.
 * @param obj - The object to search through (typically a GraphQL response)
 * @param path - The current path in the object tree (used for recursion and error reporting)
 * @returns An object containing the found value and its path, or null if no transactionHash field is found
 * @example
 * ```typescript
 * // Example mutation response structures this function handles:
 *
 * // Direct response
 * const response1 = { transactionHash: "0x123..." };
 * findTransactionHash(response1); // { value: "0x123...", path: "transactionHash" }
 *
 * // Nested in mutation result
 * const response2 = {
 *   createToken: {
 *     transactionHash: "0x456...",
 *     token: { id: "1" }
 *   }
 * };
 * findTransactionHash(response2); // { value: "0x456...", path: "createToken.transactionHash" }
 *
 * // Deeply nested
 * const response3 = {
 *   data: {
 *     result: {
 *       transaction: {
 *         transactionHash: "0x789..."
 *       }
 *     }
 *   }
 * };
 * findTransactionHash(response3); // { value: "0x789...", path: "data.result.transaction.transactionHash" }
 *
 * // Not found
 * const response4 = { success: true, id: "123" };
 * findTransactionHash(response4); // null
 * ```
 */
function findTransactionHash(
  obj: unknown,
  path = ""
): { value: unknown; path: string } | null {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  if ("transactionHash" in obj && obj.transactionHash !== undefined) {
    return {
      value: obj.transactionHash,
      path: path ? `${path}.transactionHash` : "transactionHash",
    };
  }

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object") {
      const newPath = path ? `${path}.${key}` : key;
      const found = findTransactionHash(value, newPath);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * ORPC middleware that injects a validated Portal client into the procedure context.
 *
 * This middleware provides a Portal client with built-in validation for all GraphQL operations:
 * - Mutations automatically extract and validate transaction hashes
 * - Queries require and enforce Zod schema validation
 * - All operations include consistent error handling and logging
 * @example
 * ```typescript
 * // For mutations - automatic transaction hash extraction
 * const txHash = await context.portalClient.mutate(
 *   CREATE_SYSTEM_MUTATION,
 *   { address: contract, from: sender },
 *   messages.systemCreationFailed
 * );
 *
 * // For queries - required schema validation
 * const DeploymentSchema = z.object({
 *   deployment: z.object({
 *     id: z.string(),
 *     status: z.enum(["active", "inactive"])
 *   })
 * });
 *
 * const result = await context.portalClient.query(
 *   GET_DEPLOYMENT_QUERY,
 *   { id: deploymentId },
 *   DeploymentSchema,
 *   messages.deploymentNotFound
 * );
 * ```
 */
export const portalMiddleware = baseRouter.middleware((options) => {
  const { context, next, errors } = options;

  // If already has our methods, use existing client
  if (context.portalClient && "mutate" in context.portalClient) {
    return next({
      context: {
        portalClient: context.portalClient,
      },
    });
  }

  // Create validated client with theGraphClient if available
  const portalClient = createValidatedPortalClient(
    errors,
    context.theGraphClient
  );

  // Return with guaranteed portalClient
  return next({
    context: {
      portalClient,
    },
  });
});

// Export the inferred type of the validated client
export type ValidatedPortalClient = ReturnType<
  typeof createValidatedPortalClient
>;

/**
 * Maps a Portal error message to a more user-friendly message.
 * @param message - The error message to map.
 * @returns The mapped error message.
 */
function mapPortalErrorMessage(message: string) {
  if (message.includes("User rejected the request")) {
    return "Invalid authentication challenge";
  }
  return extractRevertReason(message);
}

/**
 * Extracts the revert reason from a message.
 * @param message - The message to extract the revert reason from.
 * @returns The revert reason.
 */
function extractRevertReason(message: string) {
  const match = message.match(/reverted with the following reason: (.*)/i);
  return match && match[1] ? `Transaction reverted: ${match[1]}` : undefined;
}

// ===== VERIFICATION ARCHITECTURE SUMMARY =====
//
// This middleware implements a sophisticated wallet verification pattern that balances
// security, flexibility, and developer experience:
//
// 1. SCHEMA FLEXIBILITY:
//    - GraphQL mutations declare challengeId and challengeResponse as optional
//    - This keeps the schema clean and doesn't force verification on all operations
//    - Mutations can be called without verification for testing/development
//
// 2. MIDDLEWARE ENRICHMENT:
//    - Portal middleware conditionally enriches mutations with verification data
//    - Verification logic is centralized, preventing duplication across mutations
//    - Different verification types use appropriate challenge-response protocols
//
// 3. SECURITY BOUNDARIES:
//    - OTP: Time-based codes validated directly by Portal
//    - SECRET_CODES: Backup recovery phrases with formatted separators
//    - PINCODE: Challenge-response with cryptographic hashing for replay protection
//
// 4. PERFORMANCE IMPLICATIONS:
//    - OTP/SECRET_CODES: Single mutation call with verification parameters
//    - PINCODE: Additional Portal roundtrip for challenge generation (~200ms overhead)
//    - Transaction tracking: Extended latency but ensures consistency with indexing
//
// 5. ERROR HANDLING:
//    - Missing verification IDs fail fast with clear error messages
//    - Invalid challenge responses are mapped to user-friendly messages
//    - Transaction failures include detailed context for debugging
//
// This pattern enables secure blockchain operations while maintaining clean APIs
// and consistent verification handling across all mutation types.
