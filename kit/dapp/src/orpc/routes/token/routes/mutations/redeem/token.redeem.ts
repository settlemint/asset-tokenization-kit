import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { TokenRedeemMessagesSchema } from "./token.redeem.schema";

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
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRedeemMessagesSchema.parse(input.messages ?? {});

    // Validate input parameters
    if (!redeemAll && !amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Either amount must be provided or redeemAll must be true",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

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
          messages.redemptionFailed,
          messages
        )
      : yield* context.portalClient.mutate(
          TOKEN_REDEEM_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            amount: amount?.toString() ?? "",
            ...challengeResponse,
          },
          messages.redemptionFailed,
          messages
        );

    return getEthereumHash(transactionHash);
  });
