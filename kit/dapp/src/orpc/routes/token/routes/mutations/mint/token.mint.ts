import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_SINGLE_MINT_MUTATION = portalGraphql(`
  mutation TokenMint(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    mint: IERC3643Mint(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _to: $to
        _amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_MINT_MUTATION = portalGraphql(`
  mutation TokenBatchMint(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $toList: [String!]!
    $amounts: [String!]!
  ) {
    batchMint: ISMARTBatchMint(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _toList: $toList
        _amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const mint = tokenRouter.token.mint
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.mint,
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, recipients, amounts } = input;
    const { auth, t } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    // Generate messages using server-side translations
    // Following simplified pattern: only pending and success messages
    const pendingMessage = isBatch
      ? t("tokens:actions.mint.messages.preparingBatch")
      : t("tokens:actions.mint.messages.preparing");
    const successMessage = isBatch
      ? t("tokens:actions.mint.messages.successBatch")
      : t("tokens:actions.mint.messages.success");
    const errorMessage = isBatch
      ? t("tokens:actions.mint.messages.failedBatch")
      : t("tokens:actions.mint.messages.failed");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose the appropriate mutation based on single vs batch
    if (isBatch) {
      // Validate batch arrays
      validateBatchArrays(
        {
          recipients,
          amounts,
        },
        "batch mint"
      );

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_BATCH_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          toList: recipients,
          amounts: amounts.map((a) => a.toString()),
          ...challengeResponse,
        },
        errorMessage,
        {
          waitingForMining: pendingMessage,
          transactionIndexed: successMessage,
        }
      );

      return getEthereumHash(transactionHash);
    } else {
      const [to] = recipients;
      const [amount] = amounts;

      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_SINGLE_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          to,
          amount: amount.toString(),
          ...challengeResponse,
        },
        errorMessage,
        {
          waitingForMining: pendingMessage,
          transactionIndexed: successMessage,
        }
      );

      return getEthereumHash(transactionHash);
    }
  });
