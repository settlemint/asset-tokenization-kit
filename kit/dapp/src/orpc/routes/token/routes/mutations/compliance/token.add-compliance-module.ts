import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_ADD_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
  mutation TokenAddComplianceModule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $moduleAddress: String!
    $params: String!
  ) {
    addComplianceModule: ISMARTAddComplianceModule(
      address: $address
      from: $from
      verificationId: $verificationId
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

export const tokenAddComplianceModule =
  tokenRouter.token.tokenAddComplianceModule
    .use(
      tokenPermissionMiddleware({
        requiredRoles: TOKEN_PERMISSIONS.tokenAddComplianceModule,
      })
    )
    .use(portalMiddleware)
    .handler(async ({ input, context }) => {
      const { contract, verification, moduleAddress } = input;
      const { auth } = context;

      const sender = auth.user;
      const challengeResponse = await handleChallenge(sender, {
        code: verification.verificationCode,
        type: verification.verificationType,
      });

      await context.portalClient.mutate(
        TOKEN_ADD_COMPLIANCE_MODULE_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          moduleAddress,
          params: JSON.stringify({}), // TODO: provide params as input to the request
          ...challengeResponse,
        },
        "Failed to add compliance module"
      );

      // Return updated token data
      return await call(read, { tokenAddress: contract }, { context });
    });
