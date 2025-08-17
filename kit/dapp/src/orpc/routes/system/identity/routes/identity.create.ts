import { portalGraphql } from "@/lib/settlemint/portal";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { read as readAccount } from "@/orpc/routes/account/routes/account.read";
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
  async ({ input, context, errors }) => {
    const { walletVerification } = input;
    const { auth, system } = context;
    const sender = auth.user;

    if (!system?.identityFactory) {
      const cause = new Error("Identity factory not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    const account = await call(
      readAccount,
      {
        wallet: sender.wallet,
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

    await context.portalClient.mutate(
      IDENTITY_CREATE_MUTATION,
      {
        address: system.identityFactory,
        from: sender.wallet,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return the updated account data
    return await call(
      readAccount,
      {
        wallet: sender.wallet,
      },
      { context }
    );
  }
);
