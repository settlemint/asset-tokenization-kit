import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read as readAccount } from "@/orpc/routes/account/routes/account.read";
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

    const account = await call(
      readAccount,
      {
        wallet: walletAddress,
      },
      { context }
    );

    if (!account.identity) {
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
        identity: account.identity,
        wallet: walletAddress,
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
        wallet: walletAddress,
      },
      { context }
    );
  });
