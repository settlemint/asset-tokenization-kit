import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { validateTokenCapability } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenMintMessagesSchema } from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";

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
    batchMint: IERC3643BatchMint(
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
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, recipients, amounts } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    // Parse messages with defaults
    const messages = TokenMintMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports minting
    // Most tokens implement IERC3643 which includes mint functionality
    await validateTokenCapability(
      context.portalClient,
      contract,
      "IERC3643",
      "minting"
    );

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose the appropriate mutation based on single vs batch
    if (isBatch) {
      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_BATCH_MINT_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          toList: recipients,
          amounts,
          ...challengeResponse,
        },
        messages.mintFailed,
        messages
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
          amount,
          ...challengeResponse,
        },
        messages.mintFailed,
        messages
      );
      return getEthereumHash(transactionHash);
    }
  });
