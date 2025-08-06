import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";
import { from } from "dnum";
import type { TokenRedeemOutput } from "./token.redeem.schema";

const TOKEN_REDEEM_MUTATION = portalGraphql(`
  mutation TokenRedeem(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
  ) {
    redeem: ISMARTRedeemableRedeem(
      address: $address
      from: $from
      verificationId: $verificationId
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
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    redeemAll: ISMARTRedeemableRedeemAll(
      address: $address
      from: $from
      verificationId: $verificationId
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
  .use(portalMiddleware)
  .use(tokenMiddleware)
  .handler(async ({ input, context, errors }): Promise<TokenRedeemOutput> => {
    const { contract, verification, amount, redeemAll } = input;
    const { auth } = context;

    // Validate input parameters
    if (!redeemAll && !amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: context.t(
          "tokens:api.mutations.redeem.messages.amountOrRedeemAllRequired"
        ),
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
    // Choose mutation based on whether we're redeeming all or a specific amount
    const result = await (redeemAll
      ? context.portalClient.mutate(TOKEN_REDEEM_ALL_MUTATION, {
          address: contract,
          from: sender.wallet,
          ...challengeResponse,
        })
      : context.portalClient.mutate(TOKEN_REDEEM_MUTATION, {
          address: contract,
          from: sender.wallet,
          amount: amount?.toString() ?? "",
          ...challengeResponse,
        }));

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
