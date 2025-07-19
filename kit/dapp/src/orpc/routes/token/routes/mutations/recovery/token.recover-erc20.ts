import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_RECOVER_ERC20_MUTATION = portalGraphql(`
  mutation TokenRecoverERC20(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $tokenAddress: String!
    $recipient: String!
    $amount: String!
  ) {
    recoverERC20: ISMARTRecoverERC20(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        token: $tokenAddress
        to: $recipient
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenRecoverERC20 = tokenRouter.token.tokenRecoverERC20
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenRecoverERC20,
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, tokenAddress, recipient, amount } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const pendingMessage = t("tokens:actions.recoverERC20.messages.preparing");
    const successMessage = t("tokens:actions.recoverERC20.messages.success");
    const errorMessage = t("tokens:actions.recoverERC20.messages.failed");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_RECOVER_ERC20_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        tokenAddress,
        recipient,
        amount: amount.toString(),
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
