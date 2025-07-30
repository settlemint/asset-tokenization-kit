import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { read as readAccount } from "@/orpc/routes/account/routes/account.read";
import { call } from "@orpc/server";
import countries from "i18n-iso-countries";

const IDENTITY_REGISTER_MUTATION = portalGraphql(`
  mutation IdentityRegister(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $country: Int!
    $identity: String!
  ) {
    create: IATKIdentityRegistryRegisterIdentity(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _country: $country
        _identity: $identity
        _userAddress: $from
      }
    ) {
      transactionHash
    }
  }
`);

export const identityRegister = portalRouter.system.identityRegister
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: ["registrar"],
      getAccessControl: ({ context }) => {
        return context.system?.identityRegistry?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { verification, country } = input;
    const { auth, system } = context;
    const sender = auth.user;

    if (!system?.identityRegistry) {
      const cause = new Error("Identity registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    const account = await call(
      readAccount,
      {
        wallet: auth.user.wallet,
      },
      { context }
    );

    if (!account.identity) {
      throw errors.NOT_FOUND({
        message: "No identity found for the current user",
      });
    }

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(
      IDENTITY_REGISTER_MUTATION,
      {
        address: system.identityRegistry.id,
        from: sender.wallet,
        country: Number(countries.alpha2ToNumeric(country) ?? "0"),
        identity: account.identity,
        ...challengeResponse,
      },
      "Failed to register identity"
    );

    // Return the updated account data
    return await call(
      readAccount,
      {
        wallet: sender.wallet,
      },
      { context }
    );
  });
