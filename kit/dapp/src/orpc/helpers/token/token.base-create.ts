import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import type { ChallengeResponse } from "@/orpc/helpers/challenge-response";
import { createTokenMessagesSchema } from "@/orpc/helpers/token/token.base-create.schema";
import type {
  TransactionEventEmitted,
  ValidatedPortalClient,
} from "@/orpc/middlewares/services/portal.middleware";
import type {
  TokenCreateInput,
  TokenCreateOutput,
} from "@/orpc/routes/token/routes/token.create.schema";
import { withEventMeta } from "@orpc/server";

export interface TokenCreateContext {
  mutationVariables: {
    address: EthereumAddress;
    from: EthereumAddress;
  } & ChallengeResponse;
  portalClient: ValidatedPortalClient;
}

export async function* createToken(
  input: TokenCreateInput,
  mutateFn: (
    creationFailedMessage: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any
  ) => AsyncGenerator<TransactionEventEmitted, string, void>
): AsyncGenerator<TokenCreateOutput> {
  // Parse messages with type-specific defaults using strategy
  const messages = createTokenMessagesSchema(input.type).parse(
    input.messages ?? {}
  );

  // Yield initial loading message
  yield withEventMeta(
    {
      status: "pending" as const,
      message: messages.initialLoading,
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
      messages.tokenCreationFailed,
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
            message: messages.creatingToken,
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
            message: messages.tokenCreated,
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
            message: event.message || messages.tokenCreationFailed,
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
      error instanceof Error ? error.message : messages.defaultError;
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
        message: messages.tokenCreated,
        transactionHash: validatedHash,
        result: getEthereumHash(validatedHash),
        tokenType: [input.type],
      },
      { id: "token-creation", retry: 1000 }
    );
  }

  // TODO: Add post-creation operations like ISIN claim, role granting, etc.
}
