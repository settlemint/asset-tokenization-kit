import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_REMOVE_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
  mutation TokenRemoveComplianceModule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $moduleAddress: String!
  ) {
    removeComplianceModule: ISMARTRemoveComplianceModule(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _module: $moduleAddress
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenRemoveComplianceModule =
  tokenRouter.token.tokenRemoveComplianceModule
    .use(
      tokenPermissionMiddleware({
        requiredRoles: TOKEN_PERMISSIONS.tokenRemoveComplianceModule,
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
        TOKEN_REMOVE_COMPLIANCE_MODULE_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          moduleAddress,
          ...challengeResponse,
        },
        context.t("tokens:api.mutations.compliance.messages.removeFailed")
      );

      // Return updated token data
      return await call(read, { tokenAddress: contract }, { context });
    });
