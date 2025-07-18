import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
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
        userAddress: $userAddress
        freeze: $freeze
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenFreezeAddress = tokenRouter.token.tokenFreezeAddress
  .use(portalMiddleware)
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenFreezeAddress,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .handler(async function* ({ input, context }) {
    const { contract, verification, userAddress, freeze } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenFreezeAddressMessagesSchema.parse(
      input.messages ?? {}
    );

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
