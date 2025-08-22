import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_REMOVE_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
  mutation TokenRemoveComplianceModule(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $moduleAddress: String!
  ) {
    removeComplianceModule: ISMARTRemoveComplianceModule(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _module: $moduleAddress
      }
    ) {
      transactionHash
    }
  }
`);

export const removeComplianceModule = tokenRouter.token.removeComplianceModule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.removeComplianceModule,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, moduleAddress } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_REMOVE_COMPLIANCE_MODULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        moduleAddress,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
