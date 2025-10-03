import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ClaimTopic } from "@/orpc/helpers/claims/create-claim";
import { issueClaim } from "@/orpc/helpers/claims/issue-claim";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import type { baseRouter } from "@/orpc/procedures/base.router";
import { systemRouter } from "@/orpc/procedures/system.router";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { getTokenFactory } from "@/orpc/routes/system/token-factory/helpers/factory-context";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type {
  TokenCreateInput,
  TokenCreateSchema,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { read } from "@/orpc/routes/token/routes/token.read";
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
  query findTokenForTransaction($deployedInTransaction: Bytes, $identityFactory: String) {
    tokens(where: {deployedInTransaction: $deployedInTransaction}) {
      id
      name
      symbol
      decimals
      type
      account {
        identities(where: {identityFactory: $identityFactory}, first: 1) {
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
        identities: z.array(
          z.object({
            id: ethereumAddress,
          })
        ),
      }),
    })
  ),
});

export const create = systemRouter.token.create
  .use(
    blockchainPermissionsMiddleware<typeof TokenCreateSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.tokenCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(
    trustedIssuerMiddleware({
      selectTopics: (input) => {
        const topics = new Set<string>();
        if (input.isin) {
          topics.add(ClaimTopic.isin);
        }
        if ("basePrice" in input) {
          topics.add(ClaimTopic.basePrice);
        }
        if ("class" in input && "category" in input) {
          topics.add(ClaimTopic.assetClassification);
        }
        return [...topics];
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
        identityFactory: context.system.identityFactory.id,
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

    await issueClaims(token, input, context, errors);

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
  token: z.infer<typeof TokenQueryResultSchema>["tokens"][number],
  input: TokenCreateInput,
  context: InferRouterCurrentContexts<typeof create>,
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  const sender = context.auth.user;

  // Get the token's identity contract address from the graph data
  const tokenOnchainID = token.account.identities[0]?.id;

  if (!tokenOnchainID) {
    const errorMessage = `Token at address ${token.id} does not have an associated identity contract`;
    logger.error(errorMessage);
    throw errors.INTERNAL_SERVER_ERROR({
      message: errorMessage,
    });
  }

  const userIdentity = context.system.userIdentity?.address;
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
            topic: ClaimTopic.isin,
            data: {
              isin: input.isin,
            },
          },
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
          topic: ClaimTopic.basePrice,
          data: {
            amount,
            currencyCode,
            decimals,
          },
        },
        portalClient: context.portalClient,
      });
    })(),
    (async () => {
      if (!("class" in input && "category" in input)) {
        return;
      }
      // ISSUE ASSET CLASSIFICATION CLAIM: Add asset classification claim to token's identity contract
      await issueClaim({
        user: sender,
        issuer: userIdentity,
        walletVerification: input.walletVerification,
        identity: tokenOnchainID,
        claim: {
          topic: ClaimTopic.assetClassification,
          data: {
            class: input.class,
            category: input.category,
          },
        },
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
