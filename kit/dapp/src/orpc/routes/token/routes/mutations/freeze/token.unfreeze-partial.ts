import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_UNFREEZE_PARTIAL_TOKENS_MUTATION = portalGraphql(`
  mutation TokenUnfreezePartialTokens(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
    $userAddress: String!
  ) {
    unfreezePartialTokens: SMARTCustodianUnfreezePartialTokens(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        amount: $amount
        userAddress: $userAddress
      }
    ) {
      transactionHash
    }
  }
`);

export const unfreezePartial = tokenRouter.token.unfreezePartial
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.unfreezePartial,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, userAddress, amount } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_UNFREEZE_PARTIAL_TOKENS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        userAddress,
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
