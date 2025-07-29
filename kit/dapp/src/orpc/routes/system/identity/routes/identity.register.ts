import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read } from "@/orpc/routes/account/routes/account.read";
import { read as readSystem } from "@/orpc/routes/system/routes/system.read";
import { call } from "@orpc/server";
import { alpha2ToNumeric } from "i18n-iso-countries";

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

export const identityRegister = onboardedRouter.system.identityRegister
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { verification, country } = input;
    const { auth } = context;
    const sender = auth.user;

    const [account, systemDetails] = await Promise.all([
      call(
        read,
        {
          wallet: auth.user.wallet,
        },
        { context }
      ),
      call(
        readSystem,
        {
          id: "default",
        },
        { context }
      ),
    ]);

    if (!systemDetails.identityRegistry) {
      const cause = new Error("Identity registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

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
        address: systemDetails.identityRegistry,
        from: sender.wallet,
        country: Number(alpha2ToNumeric(country) ?? "0"),
        identity: account.identity,
        ...challengeResponse,
      },
      "Failed to register identity"
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
