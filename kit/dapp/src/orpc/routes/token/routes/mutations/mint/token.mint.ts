import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";

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
  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification, recipients, amounts } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    const sender = auth.user;
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
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      const [to] = recipients;
      const [amount] = amounts;

      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing recipient or amount",
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
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
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
