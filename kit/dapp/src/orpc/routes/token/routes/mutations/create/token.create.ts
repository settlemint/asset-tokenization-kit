import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { getRoleByFieldName } from "@/lib/constants/roles";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { getTokenFactory } from "@/orpc/routes/system/token-factory/helpers/factory-context";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { z } from "zod";

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

export const create = systemRouter.token.create
  .use(
    blockchainPermissionsMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
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

    // Define the schema for the query result
    const TokenQueryResultSchema = z.object({
      tokens: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
          type: z.string(),
          accessControl: z
            .object({
              id: z.string(),
            })
            .optional(),
        })
      ),
    });

    const result = await context.theGraphClient.query(
      FIND_TOKEN_FOR_TRANSACTION_QUERY,
      {
        input: queryVariables,
        output: TokenQueryResultSchema,
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
          console.warn(`Could not find role info for ${roleName}, skipping`);
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
    } catch (error) {
      // Log the error but don't fail the token creation
      // The token was successfully created, but convenience roles failed
      console.warn(
        "Failed to grant convenience roles after token creation:",
        error
      );
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
