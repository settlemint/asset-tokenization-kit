import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { TokenRecoverERC20MessagesSchema } from "./token.recover-erc20.schema";

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
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRecoverERC20MessagesSchema.parse(
      input.messages ?? {}
    );

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
      messages.erc20RecoveryFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
