import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_APPROVE_MUTATION = portalGraphql(`
  mutation TokenApprove(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $spender: String!
    $amount: String!
  ) {
    approve: SMARTApprove(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        spender: $spender
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const approve = tokenRouter.token.approve
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.approve,
    })
  )

  .handler(async ({ input, context }) => {
    const { contract, walletVerification, spender, amount } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_APPROVE_MUTATION,
      {
      address: contract,
      from: sender.wallet,
      spender,
      amount: amount.toString(),
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
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
