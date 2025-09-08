import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ClaimTopic } from "@/orpc/helpers/claims/create-claim";
import { issueClaim } from "@/orpc/helpers/claims/issue-claim";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
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
    }
  }
`);

// Define the schema for the query result
const TokenQueryResultSchema = z.object({
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

    await issueIsinClaim(token, input, context);

    // Return the complete token details using the read handler
    return await call(
      read,
      {
        tokenAddress: token.id,
      },
      { context }
    );
  });

async function issueIsinClaim(
  token: z.infer<typeof TokenQueryResultSchema>["tokens"][number],
  input: TokenCreateInput,
  context: InferRouterCurrentContexts<typeof create>
) {
  if (!input.isin) {
    return;
  }

  const sender = context.auth.user;

  // Get the token's identity contract address from the graph data
  const tokenOnchainID = token.account.identity?.id;

  if (!tokenOnchainID) {
    logger.error(
      `Token at address ${token.id} does not have an associated identity contract`
    );
    return;
  }

  const userIdentity = context.userIdentity?.address;
  if (!userIdentity) {
    logger.error(
      `Account at address ${context.auth.user.wallet} does not have an associated identity contract`
    );
    return;
  }

  // ISSUE CLAIM: Add isin claim to token's identity contract
  await issueClaim({
    user: sender,
    issuer: userIdentity,
    walletVerification: input.walletVerification,
    identity: tokenOnchainID,
    claim: {
      topic: ClaimTopic.isin,
      data: {
        isin: input.isin,
      },
    },
    portalClient: context.portalClient,
  });
}
