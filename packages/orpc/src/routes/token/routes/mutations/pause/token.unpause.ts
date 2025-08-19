import { portalGraphql } from "@atk/settlemint/portal";
import { call } from "@orpc/server";
import { tokenPermissionMiddleware } from "@/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/procedures/token.router";
import { read } from "@/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/routes/token/token.permissions";

const TOKEN_UNPAUSE_MUTATION = portalGraphql(`
  mutation TokenUnpause(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    unpause: ISMARTPausableUnpause(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const unpause = tokenRouter.token.unpause
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.unpause,
      requiredExtensions: ["PAUSABLE"],
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_UNPAUSE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
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
