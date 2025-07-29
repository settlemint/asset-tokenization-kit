import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_FREEZE_ADDRESS_MUTATION = portalGraphql(`
  mutation TokenFreezeAddress(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $freeze: Boolean!
  ) {
    setAddressFrozen: ISMARTCustodianSetAddressFrozen(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        userAddress: $userAddress
        freeze: $freeze
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenFreezeAddress = tokenRouter.token.tokenFreezeAddress
  .use(portalMiddleware)
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenFreezeAddress,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .use(tokenMiddleware)
  .handler(async ({ input, context }) => {
    const { contract, verification, userAddress, freeze } = input;
    const { auth } = context;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
    await context.portalClient.mutate(
      TOKEN_FREEZE_ADDRESS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        userAddress,
        freeze,
        ...challengeResponse,
      },
      freeze
        ? context.t("tokens:api.mutations.freeze.messages.freezeFailed")
        : context.t("tokens:api.mutations.freeze.messages.unfreezeFailed")
    );

    // Return the updated token data using the read handler
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
