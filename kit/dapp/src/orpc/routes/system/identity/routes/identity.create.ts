import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { read as readAccount } from "@/orpc/routes/account/routes/account.read";
import type { IdentityCreateSchema } from "@/orpc/routes/system/identity/routes/identity.create.schema";
import { call, ORPCError } from "@orpc/server";

const IDENTITY_CREATE_MUTATION = portalGraphql(`
  mutation IdentityCreate(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $wallet: String!
  ) {
    create: IATKIdentityFactoryCreateIdentity(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _managementKeys: []
        _wallet: $wallet
      }
    ) {
      transactionHash
    }
  }
`);

export const identityCreate = portalRouter.system.identityCreate
  .use(
    offChainPermissionsMiddleware<typeof IdentityCreateSchema>({
      requiredPermissions: {
        account: ["create-identity"],
      },
      alwaysAllowIf: ({ auth }, { wallet }) => {
        return (
          wallet === undefined ||
          wallet === null ||
          wallet === auth?.user.wallet
        );
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { verification, wallet } = input;
    const { auth, system } = context;
    const sender = auth.user;

    if (!system?.identityFactory) {
      const cause = new Error("Identity factory not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    const walletAddress = wallet ?? auth.user.wallet;

    const account = await call(
      readAccount,
      {
        wallet: walletAddress,
      },
      { context }
    ).catch((error: unknown) => {
      if (error instanceof ORPCError && error.status === 404) {
        return null;
      }
      throw error;
    });

    if (account?.identity) {
      throw errors.CONFLICT({
        message: "Identity already exists",
      });
    }

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(IDENTITY_CREATE_MUTATION, {
      address: system.identityFactory,
      from: sender.wallet,
      wallet: walletAddress,
      ...challengeResponse,
    });

    // Return the updated account data
    return await call(
      readAccount,
      {
        wallet: walletAddress,
      },
      { context }
    );
  });
