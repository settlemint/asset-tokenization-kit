import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { readTokenAfterMutation } from "@/orpc/helpers/post-mutation-read";
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
  .use(tokenMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { contract, verification, recipients, amounts } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    const errorMessage = isBatch
      ? "Failed to batch mint tokens"
      : "Failed to mint tokens";

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Execute the mint operation
    if (isBatch) {
      // Validate batch arrays
      validateBatchArrays(
        {
          recipients,
          amounts,
        },
        "batch mint"
      );

      await context.portalClient.mutate(
        TOKEN_BATCH_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          toList: recipients,
          amounts: amounts.map((a) => a.toString()),
          ...challengeResponse,
        },
        errorMessage
      );
    } else {
      const [to] = recipients;
      const [amount] = amounts;

      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      await context.portalClient.mutate(
        TOKEN_SINGLE_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          to,
          amount: amount.toString(),
          ...challengeResponse,
        },
        errorMessage
      );
    }

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
