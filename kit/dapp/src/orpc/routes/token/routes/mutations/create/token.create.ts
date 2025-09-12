import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import type { DynamicClaim } from "@/orpc/helpers/claims/create-claim";
import { issueClaim } from "@/orpc/helpers/claims/issue-claim";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { userIdentityMiddleware } from "@/orpc/middlewares/system/user-identity.middleware";
import type { baseRouter } from "@/orpc/procedures/base.router";
import { systemRouter } from "@/orpc/procedures/system.router";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { getTokenFactory } from "@/orpc/routes/system/token-factory/helpers/factory-context";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type {
  TokenCreateInput,
  TokenCreateSchema,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { call, InferRouterCurrentContexts } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";

const logger = createLogger();

/**
 * GraphQL query to find tokens deployed in a specific transaction.
 * Used to retrieve the token contract address after deployment.
 * Includes accessControl field for role management.
 */
const FIND_TOKEN_FOR_TRANSACTION_QUERY = theGraphGraphql(`
  query findTokenForTransaction($deployedInTransaction: Bytes) {
    tokens(where: {deployedInTransaction: $deployedInTransaction}) {
      id
      name
      symbol
      decimals
      type
      account {
        identity {
          id
        }
      }
      accessControl {
        id
      }
    }
  }
`);

/**
 * GraphQL mutation for granting roles on token access manager
 */
const TOKEN_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation TokenGrantRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    ISMARTTokenAccessManagerGrantRole(
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { role: $role, account: $account }
    ) {
      transactionHash
    }
  }
`);

// Define the schema for the query result
const _TokenQueryResultSchema = z.object({
  tokens: z.array(
    z.object({
      id: ethereumAddress,
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      type: z.string(),
      account: z.object({
        identity: z
          .object({
            id: ethereumAddress,
          })
          .optional(),
      }),
      accessControl: z
        .object({
          id: z.string(),
        })
        .optional(),
    })
  ),
});

export const create = systemRouter.token.create
  .use(
    blockchainPermissionsMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(userIdentityMiddleware)
  .handler(async ({ input, context, errors }) => {
    const tokenFactory = getTokenFactory(context, input.type);
    if (!tokenFactory) {
      throw errors.NOT_FOUND({
        message: `Token factory for type ${input.type} not found`,
      });
    }

    const handler = tokenCreateHandlerMap[input.type];

    // The handler will return the transaction hash
    const transactionHash = await handler(
      input,
      {
        mutationVariables: {
          address: tokenFactory.id,
          from: context.auth.user.wallet,
        },
        portalClient: context.portalClient,
        walletVerification: {
          sender: context.auth.user,
          code: input.walletVerification.secretVerificationCode,
          type: input.walletVerification.verificationType,
        },
      },
      context
    );

    // Query for the deployed token contract
    const queryVariables: VariablesOf<typeof FIND_TOKEN_FOR_TRANSACTION_QUERY> =
      {
        deployedInTransaction: transactionHash,
      };

    const result = await context.theGraphClient.query(
      FIND_TOKEN_FOR_TRANSACTION_QUERY,
      {
        input: queryVariables,
        output: _TokenQueryResultSchema,
      }
    );

    if (result.tokens.length === 0) {
      throw errors.NOT_FOUND({
        message: "Token not found after creation",
        cause: new Error(`Token not found for transaction ${transactionHash}`),
      });
    }

    const token = result.tokens[0];

    if (!token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token creation failed",
        cause: new Error(
          `Token object is null for transaction ${transactionHash}`
        ),
      });
    }

    await issueClaims(token, input, context, errors);

    // Grant convenience roles for easier user experience
    // This allows the creator to immediately pause/unpause, mint/burn, and manage the token
    try {
      // Get the token's access manager address from the token object
      const accessManagerAddress = token.accessControl?.id;

      if (!accessManagerAddress) {
        throw new Error("Could not retrieve access manager address for token");
      }

      const convenienceRoles: AccessControlRoles[] = [
        "emergency", // For pause/unpause operations
        "supplyManagement", // For mint/burn operations
        "custodian", // For freeze/forced transfer operations
        "governance", // For compliance and configuration
      ];

      // Grant each role individually using the same pattern as the token.grant-role mutation
      for (const roleName of convenienceRoles) {
        const roleInfo = getRoleByFieldName(roleName);
        if (!roleInfo) {
          // Could not find role info, skipping
          continue;
        }

        await context.portalClient.mutate(
          TOKEN_GRANT_ROLE_MUTATION,
          {
            address: accessManagerAddress,
            from: context.auth.user.wallet,
            account: context.auth.user.wallet,
            role: roleInfo.bytes,
          },
          {
            sender: context.auth.user,
            code: input.walletVerification.secretVerificationCode,
            type: input.walletVerification.verificationType,
          }
        );
      }
    } catch {
      // Log the error but don't fail the token creation
      // The token was successfully created, but convenience roles failed
      // Failed to grant convenience roles after token creation
    }

    // Return the complete token details using the read handler
    return await call(
      read,
      {
        tokenAddress: token.id,
      },
      { context }
    );
  });

async function issueClaims(
  token: z.infer<typeof _TokenQueryResultSchema>["tokens"][number],
  input: TokenCreateInput,
  context: InferRouterCurrentContexts<typeof create>,
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  const sender = context.auth.user;

  // Get the token's identity contract address from the graph data
  const tokenOnchainID = token.account.identity?.id;

  if (!tokenOnchainID) {
    const errorMessage = `Token at address ${token.id} does not have an associated identity contract`;
    logger.error(errorMessage);
    throw errors.INTERNAL_SERVER_ERROR({
      message: errorMessage,
    });
  }

  const userIdentity = context.userIdentity?.address;
  if (!userIdentity) {
    const errorMessage = `Account at address ${context.auth.user.wallet} does not have an associated identity contract`;
    logger.error(errorMessage);
    throw errors.INTERNAL_SERVER_ERROR({
      message: errorMessage,
    });
  }

  // ISSUE CLAIM: Add isin claim to token's identity contract
  const results = await Promise.allSettled([
    input.isin
      ? issueClaim({
          user: sender,
          issuer: userIdentity,
          walletVerification: input.walletVerification,
          identity: tokenOnchainID,
          claim: {
            topicName: "isin",
            signature: "string isin",
            data: {
              isin: input.isin,
            },
          } as DynamicClaim,
          portalClient: context.portalClient,
        })
      : Promise.resolve(),
    (async () => {
      if (!("basePrice" in input)) {
        return;
      }
      const currencyCode = await call(
        settingsRead,
        {
          key: "BASE_CURRENCY",
        },
        { context }
      );
      if (!currencyCode) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: `Base currency not set`,
        });
      }
      // ISSUE BASE PRICE CLAIM: Add base price claim to token's identity contract
      const [amount, decimals] = input.basePrice;
      await issueClaim({
        user: sender,
        issuer: userIdentity,
        walletVerification: input.walletVerification,
        identity: tokenOnchainID,
        claim: {
          topicName: "basePrice",
          signature: "uint256 amount, string currencyCode, uint8 decimals",
          data: {
            amount,
            currencyCode,
            decimals,
          },
        } as DynamicClaim,
        portalClient: context.portalClient,
      });
    })(),
  ]);

  // If any of the claims failed, throw an error
  if (results.some((result) => result.status === "rejected")) {
    const errorMessages = results
      .filter((result) => result.status === "rejected")
      .map((result): string =>
        result.reason instanceof Error
          ? result.reason.message
          : result.reason.toString()
      );
    throw errors.INTERNAL_SERVER_ERROR({
      message: errorMessages.join("\n"),
    });
  }
}
