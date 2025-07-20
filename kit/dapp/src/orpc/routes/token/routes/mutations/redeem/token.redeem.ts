import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getConditionalMutationMessages } from "@/orpc/helpers/mutation-messages";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

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

export const tokenRedeem = tokenRouter.token.tokenRedeem
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenRedeem,
      requiredExtensions: ["REDEEMABLE"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, amount, redeemAll } = input;
    const { auth, t } = context;

    // Validate input parameters
    if (!redeemAll && !amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Either amount must be provided or redeemAll must be true",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    // Generate messages using server-side translations
    const { pendingMessage, successMessage, errorMessage } =
      getConditionalMutationMessages(
        t,
        "tokens",
        "redeem",
        Boolean(redeemAll),
        {
          keys: {
            preparing: redeemAll ? "preparingAll" : "preparing",
            success: redeemAll ? "successAll" : "success",
            failed: redeemAll ? "failedAll" : "failed",
          },
        }
      );

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose mutation based on whether we're redeeming all or a specific amount
    const transactionHash = redeemAll
      ? yield* context.portalClient.mutate(
          TOKEN_REDEEM_ALL_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            ...challengeResponse,
          },
          errorMessage,
          {
            waitingForMining: pendingMessage,
            transactionIndexed: successMessage,
          }
        )
      : yield* context.portalClient.mutate(
          TOKEN_REDEEM_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            amount: amount?.toString() ?? "",
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
