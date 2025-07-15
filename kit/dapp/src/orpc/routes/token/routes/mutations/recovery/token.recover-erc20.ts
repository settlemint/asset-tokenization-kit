import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenRecoverERC20MessagesSchema } from "./token.recover-erc20.schema";

const TOKEN_RECOVER_ERC20_MUTATION = portalGraphql(`
  mutation TokenRecoverERC20(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $tokenAddress: String!
    $recipient: String!
    $amount: String!
  ) {
    recoverERC20: ISMARTRecoverERC20(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        token: $tokenAddress
        to: $recipient
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenRecoverERC20 = tokenRouter.token.tokenRecoverERC20
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, tokenAddress, recipient, amount } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRecoverERC20MessagesSchema.parse(
      input.messages ?? {}
    );

    // Validate that the token supports ERC20 recovery operations
    // All ISMART tokens should support this, but let's check for ERC3643 as a proxy
    const supportsRecovery = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.IERC3643
    );

    if (!supportsRecovery) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support ERC20 recovery operations. The token must implement IERC3643 interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_RECOVER_ERC20_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        tokenAddress,
        recipient,
        amount: amount.toString(),
        ...challengeResponse,
      },
      messages.erc20RecoveryFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
