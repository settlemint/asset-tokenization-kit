import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenBurnMessagesSchema } from "@/orpc/routes/token/routes/mutations/burn/token.burn.schema";

const TOKEN_SINGLE_BURN_MUTATION = portalGraphql(`
  mutation TokenBurn(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $amount: String!
  ) {
    burn: IERC3643Burn(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _userAddress: $userAddress
        _amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_BURN_MUTATION = portalGraphql(`
  mutation TokenBatchBurn(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddresses: [String!]!
    $amounts: [String!]!
  ) {
    batchBurn: IERC3643BatchBurn(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _userAddresses: $userAddresses
        _amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const burn = tokenRouter.token.burn
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, addresses, amounts } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = addresses.length > 1;

    // Parse messages with defaults
    const messages = TokenBurnMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports burning
    // Check for ISMARTBurnable first, then fall back to IERC3643
    const [supportsBurnable, supportsERC3643] = await Promise.all([
      supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.ISMARTBurnable
      ),
      supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.IERC3643
      ),
    ]);

    if (!supportsBurnable && !supportsERC3643) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support burning operations. The token must implement ISMARTBurnable or IERC3643 interface.",
      });
    }

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
          addresses,
          amounts,
        },
        "batch burn"
      );

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_BATCH_BURN_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          userAddresses: addresses,
          amounts: amounts.map((a) => a.toString()),
          ...challengeResponse,
        },
        messages.burnFailed,
        messages
      );
      return getEthereumHash(transactionHash);
    } else {
      const [userAddress] = addresses;
      const [amount] = amounts;

      if (!userAddress || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required address or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_SINGLE_BURN_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          userAddress,
          amount: amount.toString(),
          ...challengeResponse,
        },
        messages.burnFailed,
        messages
      );
      return getEthereumHash(transactionHash);
    }
  });
