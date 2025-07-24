import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read as readAccount } from "@/orpc/routes/account/routes/account.read";
import { read as readSystem } from "@/orpc/routes/system/routes/system.read";
import { call } from "@orpc/server";
import { alpha2ToNumeric } from "i18n-iso-countries";

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

export const identityCreate = onboardedRouter.system.identityCreate
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { verification, country } = input;
    const { auth, t } = context;
    const sender = auth.user;

    const account = await call(
      readAccount,
      {
        wallet: auth.user.wallet,
      },
      { context }
    );

    const systemDetails = await call(
      readSystem,
      {
        id: "default",
      },
      { context }
    );

    if (!systemDetails?.identityRegistry || !systemDetails?.identityFactory) {
      const cause = new Error("Identity factory or registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    if (!account.identity) {
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

      yield* context.portalClient.mutate(
        IDENTITY_CREATE_MUTATION,
        {
          address: systemDetails?.identityFactory,
          from: sender.wallet,
          ...challengeResponse,
        },
        identityCreateMessages.errorMessage,
        {
          waitingForMining: identityCreateMessages.pendingMessage,
          transactionIndexed: identityCreateMessages.successMessage,
        }
      );
    }

    const updatedAccount = await call(
      readAccount,
      {
        wallet: auth.user.wallet,
      },
      { context }
    );
    const identityAddress = updatedAccount.identity;
    if (!identityAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Identity not found",
        cause: new Error(`Identity not found for account ${auth.user.wallet}`),
      });
    }

    const identityRegisterMessages = getMutationMessages(
      t,
      "system",
      "identityRegister"
    );

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      IDENTITY_REGISTER_MUTATION,
      {
        address: systemDetails?.identityRegistry,
        from: sender.wallet,
        country: Number(alpha2ToNumeric(country) ?? "0"),
        identity: identityAddress,
        ...challengeResponse,
      },
      identityRegisterMessages.errorMessage,
      {
        waitingForMining: identityRegisterMessages.pendingMessage,
        transactionIndexed: identityRegisterMessages.successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
