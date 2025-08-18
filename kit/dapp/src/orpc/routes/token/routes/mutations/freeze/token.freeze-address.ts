import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_FREEZE_ADDRESS_MUTATION = portalGraphql(`
  mutation TokenFreezeAddress(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $freeze: Boolean!
  ) {
    setAddressFrozen: ISMARTCustodianSetAddressFrozen(
      address: $address
      from: $from
      challengeId: $challengeId
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

export const freezeAddress = tokenRouter.token.freezeAddress
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.freezeAddress,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, userAddress, freeze } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_FREEZE_ADDRESS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        userAddress,
        freeze,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

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
