import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_REDEEM_FOR_MUTATION = portalGraphql(`
  mutation TokenRedeemFor(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $owner: String!
    $amount: String!
  ) {
    redeemFor: ISMARTRedeemableRedeemFor(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        owner: $owner
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const redeem = tokenRouter.token.redeem
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.redeem,
      requiredExtensions: ["REDEEMABLE"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification, amount, owner } = input;
    const { auth } = context;

    if (!amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Amount required",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    const sender = auth.user;
    const ownerAddress = owner ?? sender.wallet;

    await context.portalClient.mutate(
      TOKEN_REDEEM_FOR_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        owner: ownerAddress,
        amount: amount.toString(),
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

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
