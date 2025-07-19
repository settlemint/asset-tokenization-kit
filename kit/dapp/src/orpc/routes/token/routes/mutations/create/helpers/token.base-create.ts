import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import type { ChallengeResponse } from "@/orpc/helpers/challenge-response";
import type { i18nContext } from "@/orpc/middlewares/i18n/i18n.middleware";
import type {
  TransactionEventEmitted,
  ValidatedPortalClient,
} from "@/orpc/middlewares/services/portal.middleware";
import type {
  TokenCreateInput,
  TokenCreateOutput,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { withEventMeta } from "@orpc/server";

export interface TokenCreateContext {
  mutationVariables: {
    address: EthereumAddress;
    from: EthereumAddress;
  } & ChallengeResponse;
  portalClient: ValidatedPortalClient;
  t: i18nContext["t"];
}

export async function* createToken(
  input: TokenCreateInput,
  context: TokenCreateContext,
  mutateFn: (
    creationFailedMessage: string,
    messages: {
      waitingForMining: string;
      transactionFailed: string;
      transactionDropped: string;
      waitingForIndexing: string;
      transactionIndexed: string;
      indexingTimeout: string;
      streamTimeout: string;
    }
  ) => AsyncGenerator<TransactionEventEmitted, string, void>
): AsyncGenerator<TokenCreateOutput> {
  const { t } = context;

  // Build messages for transaction tracking
  const messages = {
    waitingForMining: t("common:transaction.waitingForMining"),
    transactionFailed: t("common:transaction.transactionFailed"),
    transactionDropped: t("common:transaction.transactionDropped"),
    waitingForIndexing: t("common:transaction.waitingForIndexing"),
    transactionIndexed: t("common:transaction.transactionIndexed"),
    indexingTimeout: t("common:transaction.indexingTimeout"),
    streamTimeout: t("common:transaction.streamTimeout"),
  };

  // Yield initial loading message
  yield withEventMeta(
    {
      status: "pending" as const,
      message: t("tokens:create.preparing", { type: input.type }),
      tokenType: [input.type],
    },
    { id: "token-creation", retry: 1000 }
  );

  // Execute transaction with real-time tracking
  let validatedHash = "";
  let hasConfirmedEvent = false;

  try {
    // Use the Portal client's mutate method that returns an async generator
    // This enables real-time transaction tracking for token creation
    for await (const event of mutateFn(
      t("tokens:create.failed", { type: input.type }),
      messages
    )) {
      // Store transaction hash from the first event
      validatedHash = event.transactionHash;

      // Handle different event statuses and yield appropriate progress updates
      if (event.status === "pending") {
        // Yield pending events to show transaction progress
        yield withEventMeta(
          {
            status: "pending" as const,
            message: t("tokens:create.creating", { type: input.type }),
            transactionHash: validatedHash,
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      } else if (event.status === "confirmed") {
        hasConfirmedEvent = true;
        yield withEventMeta(
          {
            status: "confirmed" as const,
            message: t("tokens:create.success", { type: input.type }),
            transactionHash: validatedHash,
            result: getEthereumHash(validatedHash),
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      } else {
        // event.status === "failed"
        yield withEventMeta(
          {
            status: "failed" as const,
            message:
              event.message || t("tokens:create.failed", { type: input.type }),
            transactionHash: validatedHash,
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      }
    }
  } catch (error) {
    // Handle any errors during mutation execution
    const errorMessage =
      error instanceof Error
        ? error.message
        : t("tokens:create.error.default", { type: input.type });
    yield withEventMeta(
      {
        status: "failed" as const,
        message: errorMessage,
        transactionHash: validatedHash,
        tokenType: [input.type],
      },
      { id: "token-creation", retry: 1000 }
    );
    return;
  }

  // Ensure we always yield a result if no confirmed event was received
  if (!hasConfirmedEvent && validatedHash) {
    yield withEventMeta(
      {
        status: "confirmed" as const,
        message: t("tokens:create.success", { type: input.type }),
        transactionHash: validatedHash,
        result: getEthereumHash(validatedHash),
        tokenType: [input.type],
      },
      { id: "token-creation", retry: 1000 }
    );
  }

  // TODO: Add post-creation operations like ISIN claim, role granting, etc.
}
