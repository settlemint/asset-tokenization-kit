import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { from } from "dnum";
import { read } from "../../token.read";
import type { TokenRedeemOutput } from "./token.redeem.schema";

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
  .handler(async ({ input, context, errors }): Promise<TokenRedeemOutput> => {
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
    const result = await (redeemAll
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

    // Get updated token data
    const updatedToken = await call(
      read,
      { tokenAddress: contract },
      { context }
    );

    // Calculate redeemed amount
    const amountRedeemed = redeemAll
      ? from(0, updatedToken.decimals) // We don't know the exact amount for redeemAll
      : from(amount ?? 0, updatedToken.decimals);

    return {
      txHash: result,
      data: {
        amountRedeemed,
        redeemedAll: redeemAll,
        tokenName: updatedToken.name,
        tokenSymbol: updatedToken.symbol,
        totalRedeemedAmount: updatedToken.redeemable?.redeemedAmount,
      },
    };
  });
