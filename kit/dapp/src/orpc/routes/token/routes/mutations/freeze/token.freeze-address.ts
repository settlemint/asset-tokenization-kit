import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

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
  .handler(async function* ({ input, context }) {
    const { contract, verification, userAddress, freeze } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const messageKey = freeze ? "freeze" : "unfreeze";
    const pendingMessage = t(`tokens:actions.${messageKey}.messages.preparing`);
    const successMessage = t(`tokens:actions.${messageKey}.messages.success`);
    const errorMessage = t(`tokens:actions.${messageKey}.messages.failed`);

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_FREEZE_ADDRESS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        userAddress,
        freeze,
        ...challengeResponse,
      },
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
