import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";

const TOKEN_RECOVER_ERC20_MUTATION = portalGraphql(`
  mutation TokenRecoverERC20(
    $challengeId: String
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
      challengeId: $challengeId
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

export const recoverERC20 = tokenRouter.token.recoverERC20
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.recoverERC20,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, tokenAddress, recipient, amount } =
      input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_RECOVER_ERC20_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        tokenAddress,
        recipient,
        amount: amount.toString(),
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
