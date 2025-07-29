import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
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

export const identityCreate = portalRouter.system.identityCreate.handler(
  async function* ({ input, context, errors }) {
    const { verification } = input;
    const { auth, t, system } = context;
    const sender = auth.user;

    const account = await call(readAccount, {}, { context }).catch(
      (error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return null;
        }
        throw error;
      }
    );

    if (!system?.identityFactory) {
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
        address: system.identityFactory.id,
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
  }
);
