import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_REDEEM_MUTATION = portalGraphql(`
  mutation TokenRedeem(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
  ) {
    redeem: ISMARTRedeemableRedeem(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_REDEEM_ALL_MUTATION = portalGraphql(`
  mutation TokenRedeemAll(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    redeemAll: ISMARTRedeemableRedeemAll(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
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
    const { contract, walletVerification, amount, redeemAll } = input;
    const { auth } = context;

    // Validate input parameters
    if (!redeemAll && !amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Amount or redeem all required",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    const sender = auth.user;
    // Choose mutation based on whether we're redeeming all or a specific amount
    await (redeemAll
      ? context.portalClient.mutate(
          TOKEN_REDEEM_ALL_MUTATION,
          {
            address: contract,
            from: sender.wallet,
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        )
      : context.portalClient.mutate(
          TOKEN_REDEEM_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            amount: amount?.toString() ?? "",
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        ));

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
