import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { read as readSystem } from "@/orpc/routes/system/routes/system.read";
import { call, ORPCError } from "@orpc/server";

const IDENTITY_CREATE_MUTATION = portalGraphql(`
  mutation IdentityCreate(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    create: IATKIdentityFactoryCreateIdentity(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _managementKeys: []
        _wallet: $from
      }
    ) {
      transactionHash
    }
  }
`);

export const identityCreate = onboardedRouter.system.identityCreate
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { verification } = input;
    const { auth, t } = context;
    const sender = auth.user;

    const [account, systemDetails] = await Promise.all([
      call(readAccount, {}, { context }).catch((error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return null;
        }
        throw error;
      }),
      call(
        readSystem,
        {
          id: "default",
        },
        { context }
      ),
    ]);

    if (!systemDetails.identityFactory) {
      const cause = new Error("Identity factory not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    if (account?.identity) {
      throw errors.CONFLICT({
        message: "Identity already exists",
      });
    }

    // Generate messages using server-side translations
    const identityCreateMessages = getMutationMessages(
      t,
      "system",
      "identityCreate"
    );

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      IDENTITY_CREATE_MUTATION,
      {
        address: systemDetails.identityFactory,
        from: sender.wallet,
        ...challengeResponse,
      },
      identityCreateMessages.errorMessage,
      {
        waitingForMining: identityCreateMessages.pendingMessage,
        transactionIndexed: identityCreateMessages.successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
