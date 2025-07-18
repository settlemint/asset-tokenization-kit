import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenPauseMessagesSchema } from "@/orpc/routes/token/routes/mutations/pause/token.pause.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { withEventMeta } from "@orpc/server";

const TOKEN_PAUSE_MUTATION = portalGraphql(`
  mutation TokenPause(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    pause: ISMARTPausablePause(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pause = tokenRouter.token.pause
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.pause,
      requiredExtensions: ["PAUSABLE"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenPauseMessagesSchema.parse(input.messages ?? {});

    yield withEventMeta(
      {
        status: "pending" as const,
        message: messages.preparingPause,
      },
      { id: "token-pause", retry: 1000 }
    );

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    yield withEventMeta(
      {
        status: "pending" as const,
        message: messages.submittingPause,
      },
      { id: "token-pause", retry: 1000 }
    );

    let validatedHash = "";
    let hasConfirmedEvent = false;

    try {
      for await (const event of context.portalClient.mutate(
        TOKEN_PAUSE_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          ...challengeResponse,
        },
        messages.pauseFailed,
        messages
      )) {
        validatedHash = event.transactionHash;

        if (event.status === "pending") {
          yield withEventMeta(
            {
              status: "pending" as const,
              message: messages.waitingForMining,
              transactionHash: validatedHash,
            },
            { id: "token-pause", retry: 1000 }
          );
        } else if (event.status === "confirmed") {
          hasConfirmedEvent = true;
          yield withEventMeta(
            {
              status: "confirmed" as const,
              message: messages.tokenPaused,
              transactionHash: validatedHash,
              result: getEthereumHash(validatedHash),
            },
            { id: "token-pause", retry: 1000 }
          );
        } else {
          // event.status === "failed"
          yield withEventMeta(
            {
              status: "failed" as const,
              message: event.message || messages.pauseFailed,
              transactionHash: validatedHash,
            },
            { id: "token-pause", retry: 1000 }
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : messages.defaultError;
      yield withEventMeta(
        {
          status: "failed" as const,
          message: errorMessage,
          transactionHash: validatedHash,
        },
        { id: "token-pause", retry: 1000 }
      );
      return;
    }

    if (!hasConfirmedEvent && validatedHash) {
      yield withEventMeta(
        {
          status: "confirmed" as const,
          message: messages.tokenPaused,
          transactionHash: validatedHash,
          result: getEthereumHash(validatedHash),
        },
        { id: "token-pause", retry: 1000 }
      );
    }
  });
