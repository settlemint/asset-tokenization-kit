import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { validateTokenCapability } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenTransferMessagesSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";

const TOKEN_FORCED_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenForcedTransfer(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $sender: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    forcedTransfer: ISMARTCustodianForcedTransfer(
      address: $address
      from: $sender
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        from: $from
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
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $sender: String!
    $fromList: [String!]!
    $toList: [String!]!
    $amounts: [String!]!
  ) {
    batchForcedTransfer: ISMARTCustodianBatchForcedTransfer(
      address: $address
      from: $sender
      verificationId: $verificationId
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
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, from, recipients, amounts, verification } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = from.length > 1;

    // Parse messages with defaults
    const messages = TokenTransferMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports custodian operations
    await validateTokenCapability(
      context.portalClient,
      contract,
      "ISMARTCustodian",
      "forced transfer"
    );

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose the appropriate mutation based on single vs batch
    if (isBatch) {
      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_BATCH_FORCED_TRANSFER_MUTATION,
        {
          address: contract,
          sender: sender.wallet, // The custodian executing the transaction
          fromList: from,
          toList: recipients,
          amounts: amounts.map((a) => a.toString()),
          ...challengeResponse,
        },
        messages.transferFailed,
        messages
      );
      return getEthereumHash(transactionHash);
    } else {
      const [fromAddress] = from;
      const [to] = recipients;
      const [amount] = amounts;

      if (!fromAddress || !to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required from, to, or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_FORCED_TRANSFER_MUTATION,
        {
          address: contract,
          sender: sender.wallet, // The custodian executing the transaction
          from: fromAddress, // The address whose tokens are being transferred
          to,
          amount: amount.toString(),
          ...challengeResponse,
        },
        messages.transferFailed,
        messages
      );
      return getEthereumHash(transactionHash);
    }
  });
