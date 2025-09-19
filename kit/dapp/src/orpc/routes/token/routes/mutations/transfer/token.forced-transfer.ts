import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";

const TOKEN_FORCED_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenForcedTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $owner: String!
    $to: String!
    $amount: String!
  ) {
    forcedTransfer: ISMARTCustodianForcedTransfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        from: $owner
        to: $to
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_FORCED_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenBatchForcedTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $fromList: [String!]!
    $toList: [String!]!
    $amounts: [String!]!
  ) {
    batchForcedTransfer: ISMARTCustodianBatchForcedTransfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        fromList: $fromList
        toList: $toList
        amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const forcedTransfer = tokenRouter.token.forcedTransfer
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.forcedTransfer,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { contract, recipients, amounts, from: owners, walletVerification } =
      input;
    const sender = context.auth.user;
    const isBatch = recipients.length > 1;

    if (isBatch) {
      validateBatchArrays(
        {
          from: owners,
          recipients,
          amounts,
        },
        "batch forced transfer"
      );

      await context.portalClient.mutate(
        TOKEN_BATCH_FORCED_TRANSFER_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          fromList: owners,
          toList: recipients,
          amounts: amounts.map((amount) => amount.toString()),
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      const [owner] = owners;
      const [to] = recipients;
      const [amount] = amounts;

      if (!owner || !to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required fields for forced transfer",
          data: { errors: ["Invalid input data"] },
        });
      }

      await context.portalClient.mutate(
        TOKEN_FORCED_TRANSFER_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          owner,
          to,
          amount: amount.toString(),
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    }

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
