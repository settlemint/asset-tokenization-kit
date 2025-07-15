import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenFreezeAddressMessagesSchema } from "./token.freeze-address.schema";

const TOKEN_FREEZE_ADDRESS_MUTATION = portalGraphql(`
  mutation TokenFreezeAddress(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $freeze: Boolean!
  ) {
    setAddressFrozen: ISMARTCustodianSetAddressFrozen(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _userAddress: $userAddress
        _freeze: $freeze
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenFreezeAddress = tokenRouter.token.tokenFreezeAddress
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, userAddress, freeze } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenFreezeAddressMessagesSchema.parse(
      input.messages ?? {}
    );

    // Validate that the token supports custodian operations
    const supportsCustodian = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.ISMARTCustodian
    );

    if (!supportsCustodian) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support custodian operations. The token must implement ISMARTCustodian interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_FREEZE_ADDRESS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        userAddress,
        freeze,
        ...challengeResponse,
      },
      messages.freezeFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
