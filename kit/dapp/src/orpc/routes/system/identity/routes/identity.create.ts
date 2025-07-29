import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { read } from "@/orpc/routes/account/routes/account.read";
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
  .handler(async ({ input, context, errors }) => {
    const { verification } = input;
    const { auth } = context;
    const sender = auth.user;

    // Parallel fetch of account and system details
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

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(
      IDENTITY_CREATE_MUTATION,
      {
        address: systemDetails.identityFactory,
        from: sender.wallet,
        ...challengeResponse,
      },
      "Failed to create identity"
    );

    // Return the updated account data
    return await call(
      read,
      {
        wallet: sender.wallet,
      },
      { context }
    );
  });
