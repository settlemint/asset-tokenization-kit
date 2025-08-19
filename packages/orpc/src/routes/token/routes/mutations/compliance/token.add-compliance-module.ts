import { portalGraphql } from "@atk/settlemint/portal";
import { call } from "@orpc/server";
import { tokenPermissionMiddleware } from "@/middlewares/auth/token-permission.middleware";
import { portalRouter } from "@/procedures/portal.router";
import { read } from "@/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/routes/token/token.permissions";

const TOKEN_ADD_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
  mutation TokenAddComplianceModule(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $moduleAddress: String!
    $params: String!
  ) {
    addComplianceModule: ISMARTAddComplianceModule(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _module: $moduleAddress
        _params: $params
      }
    ) {
      transactionHash
    }
  }
`);

export const addComplianceModule = portalRouter.token.addComplianceModule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.addComplianceModule,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, moduleAddress } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_ADD_COMPLIANCE_MODULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        moduleAddress,
        params: JSON.stringify({}), // TODO: provide params as input to the request
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
