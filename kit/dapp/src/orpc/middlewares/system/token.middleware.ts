import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { baseRouter } from "@/orpc/procedures/base.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { isEthereumAddress } from "@atk/zod/ethereum-address";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { from } from "dnum";
import { createPublicClient, http } from "viem";
import { anvil } from "viem/chains";
import z from "zod";

const logger = createLogger();

// ABI for the findValidCollateralClaim function
const COLLATERAL_ABI = [
  {
    inputs: [],
    name: "findValidCollateralClaim",
    outputs: [
      { name: "amount", type: "uint256" },
      { name: "issuer", type: "address" },
      { name: "expiryTimestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Create viem client for direct contract calls
const publicClient = createPublicClient({
  chain: anvil,
  transport: http(process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT),
});

/**
 * Query collateral directly from the smart contract to get real-time collateral data.
 *
 * @remarks
 * WHY DIRECT CONTRACT QUERIES: TheGraph indexing can lag behind blockchain state,
 * causing stale collateral data during rapid updates. Direct contract calls ensure
 * UI always shows the most current collateral amount for mint/burn operations.
 *
 * PERFORMANCE TRADEOFF: Additional contract call adds ~100ms latency but prevents
 * users from seeing incorrect collateral ratios that could lead to failed transactions.
 *
 * TOKEN TYPE FILTERING: Only stablecoins implement the ISMARTCollateral interface.
 * Querying non-collateral tokens would cause contract reverts, so we filter by type
 * to avoid unnecessary network calls and error noise in logs.
 *
 * @param tokenAddress - Contract address to query for collateral data
 * @param tokenType - Token type to determine if collateral querying is applicable
 * @returns Collateral data with validity check, or zero values for non-stablecoin types
 */
async function queryContractCollateral(
  tokenAddress: `0x${string}`,
  tokenType?: string
) {
  // INTERFACE CONSTRAINT: Only stablecoins implement ISMARTCollateral interface
  // WHY: Other token types (bonds, equities) don't have collateral backing mechanism
  if (tokenType !== "stablecoin") {
    logger.debug(
      `⏭️ Skipping collateral query for ${tokenType} token: ${tokenAddress}`
    );
    return {
      amount: from(0),
      issuer: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      expiryTimestamp: 0,
      hasValidClaim: false,
    };
  }

  try {
    logger.info(`🔍 Querying collateral for stablecoin token: ${tokenAddress}`);

    // DIRECT CONTRACT CALL: Bypass TheGraph to get most current collateral state
    const result = await publicClient.readContract({
      address: tokenAddress,
      abi: COLLATERAL_ABI,
      functionName: "findValidCollateralClaim",
    });

    const [amount, issuer, expiryTimestamp] = result;

    logger.info(`📊 Contract collateral result:`, {
      tokenAddress,
      amount: amount.toString(),
      issuer,
      expiryTimestamp: Number(expiryTimestamp),
      currentTime: Math.floor(Date.now() / 1000),
    });

    // CONSISTENT TIMESTAMP HANDLING: Use BigInt for comparison to match contract precision
    const currentTime = BigInt(Math.floor(Date.now() / 1000));

    return {
      amount: from(amount.toString(), 18), // PRECISION: Convert to Dnum with 18 decimals for consistent math
      issuer,
      expiryTimestamp: Number(expiryTimestamp),
      // VALIDITY CHECK: Claim must have amount > 0 AND not be expired
      hasValidClaim: amount > 0n && expiryTimestamp > currentTime,
    };
  } catch (error) {
    // GRACEFUL DEGRADATION: Return safe defaults instead of throwing to prevent
    // token middleware from failing when collateral contracts have issues
    logger.warn(
      `❌ Failed to query collateral from stablecoin contract ${tokenAddress}:`,
      error
    );
    return {
      amount: from(0),
      issuer: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      expiryTimestamp: 0,
      hasValidClaim: false,
      // ERROR CONTEXT: Preserve error for debugging without breaking token operations
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!) {
    token(id: $id) {
      id
      type
      createdAt
      name
      symbol
      decimals
      totalSupply
      extensions
      implementsERC3643
      implementsSMART
      account {
        identity {
          id
        }
      }
      pausable {
        paused
      }
      capped {
        cap
      }
      createdBy {
        id
      }
      redeemable {
        redeemedAmount
      }
      bond {
        faceValue
        isMatured
        maturityDate
      }
      fund {
        managementFeeBps
      }
      collateral {
        collateral
        expiryTimestamp
      }
      accessControl {
        ...AccessControlFragment
      }
      yield: yield_ {
        id
        schedule {
          id
        }
      }
    }
  }
  `,
  [AccessControlFragment]
);

/**
 * Middleware to inject the token context into the request context.
 * @returns The middleware function.
 */
export const tokenMiddleware = baseRouter.middleware(
  async ({ next, context, errors }, input) => {
    // Always fetch fresh token data - no caching
    const { auth, userClaimTopics, theGraphClient } = context;

    // Early authorization check before making expensive queries
    if (!auth?.user.wallet) {
      logger.warn("sessionMiddleware should be called before tokenMiddleware");
      throw errors.UNAUTHORIZED({
        message: "Authentication required to access token information",
      });
    }

    if (!userClaimTopics) {
      logger.warn(
        "userClaimsMiddleware should be called before tokenMiddleware"
      );
      throw errors.INTERNAL_SERVER_ERROR({
        message: "User claim topics context not set",
      });
    }

    if (!theGraphClient) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "theGraphMiddleware should be called before tokenMiddleware",
      });
    }

    const tokenAddress = getTokenAddress(input);

    if (!isEthereumAddress(tokenAddress)) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Token address is not a valid Ethereum address",
        data: {
          errors: ["Token address is not a valid Ethereum address"],
        },
      });
    }

    // Fetch token data from The Graph
    const result = await theGraphClient.query(READ_TOKEN_QUERY, {
      input: {
        id: tokenAddress,
      },
      output: z.object({
        token: TokenSchema,
      }),
    });

    const token = result.token;

    // REAL-TIME COLLATERAL DATA: Query contract directly to ensure fresh data for UI
    // WHY: TheGraph can have indexing delays during rapid collateral updates
    const contractCollateral = await queryContractCollateral(
      tokenAddress,
      token.type
    );

    const userRoles = mapUserRoles(auth.user.wallet, token.accessControl);

    const tokenContext = TokenSchema.parse({
      ...token,
      // DATA FRESHNESS: Override indexed collateral with real-time contract data
      // TRADEOFF: Small latency increase for guaranteed data accuracy
      collateral: token.collateral
        ? {
            ...token.collateral,
            // AMOUNT OVERRIDE: Use fresh contract amount for accurate supply calculations
            collateral: contractCollateral.amount,
            // EXPIRY PREFERENCE: Use contract expiry if available, fall back to indexed data
            expiryTimestamp:
              contractCollateral.expiryTimestamp > 0
                ? contractCollateral.expiryTimestamp
                : token.collateral.expiryTimestamp,
          }
        : null,
      // DEBUGGING CONTEXT: Include raw contract response for troubleshooting
      contractCollateral,
      userPermissions: {
        roles: userRoles,
        // TODO: implement logic which checks if the user is allowed to interact with the token
        // user is not allowed when in the block list or when it requires an allow list
        // Another reason could be that the user is a citizen of a blocked country
        // We should do this in the subgraph, more fine grained so we can derive the reason here
        isAllowed: true,
        notAllowedReason: undefined,
        actions: (() => {
          // Initialize all actions as false
          const initialActions: Record<
            keyof typeof TOKEN_PERMISSIONS,
            boolean
          > = {
            burn: false,
            create: false,
            grantRole: false,
            revokeRole: false,
            mint: false,
            pause: false,
            addComplianceModule: false,
            approve: false,
            forcedRecover: false,
            freezeAddress: false,
            recoverERC20: false,
            recoverTokens: false,
            redeem: false,
            removeComplianceModule: false,
            setCap: false,
            setYieldSchedule: false,
            transfer: false,
            unpause: false,
            updateCollateral: false,
          };

          // Update based on user roles using the flexible role requirement system
          Object.entries(TOKEN_PERMISSIONS).forEach(
            ([action, roleRequirement]) => {
              const userRoleList = Object.entries(userRoles)
                .filter(([_, hasRole]) => hasRole)
                .map(([role]) => role) as AccessControlRoles[];

              initialActions[action as keyof typeof TOKEN_PERMISSIONS] =
                satisfiesRoleRequirement(userRoleList, roleRequirement);
            }
          );

          return initialActions;
        })(),
      },
    });

    return next({
      context: {
        token: tokenContext,
      },
    });
  }
);

/**
 * Get the token address from the input.
 * @param input - The input object.
 * @returns The token address.
 */
function getTokenAddress(input: unknown) {
  if (input === null || input === undefined) {
    return null;
  }
  if (typeof input === "string") {
    return input;
  }
  if (typeof input === "object" && "tokenAddress" in input) {
    return input.tokenAddress;
  }
  if (typeof input === "object" && "contract" in input) {
    return input.contract;
  }
  return null;
}
