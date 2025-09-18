import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
import countries from "i18n-iso-countries";

const IDENTITY_REGISTER_MUTATION = portalGraphql(`
  mutation IdentityRegister(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $country: Int!
    $wallet: String!
    $identity: String!
  ) {
    create: IATKIdentityRegistryRegisterIdentity(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _country: $country
        _identity: $identity
        _userAddress: $wallet
      }
    ) {
      transactionHash
    }
  }
`);

export const identityRegister = onboardedRouter.system.identity.register
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.identityRegister,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { walletVerification, country, wallet } = input;
    const { auth, system } = context;
    const sender = auth.user;

    const walletAddress = wallet ?? auth.user.wallet;

    const identity = await call(
      identityRead,
      {
        wallet: walletAddress,
      },
      { context }
    );

    if (!identity) {
      throw errors.NOT_FOUND({
        message: `No identity found for the account "${walletAddress}"`,
      });
    }

    await context.portalClient.mutate(
      IDENTITY_REGISTER_MUTATION,
      {
        address: system.identityRegistry.id,
        from: sender.wallet,
        country: Number(countries.alpha2ToNumeric(country) ?? "0"),
        identity: identity.id,
        wallet: walletAddress,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return the updated identity data
    return await call(
      identityRead,
      {
        wallet: walletAddress,
      },
      { context }
    );
  });
