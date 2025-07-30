import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

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

export const removeComplianceModule = portalRouter.token.removeComplianceModule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.removeComplianceModule,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { verification, moduleAddress } = input;
    const { auth, system } = context;

    const contract = system?.complianceModuleRegistry?.id;
    if (!contract) {
      const cause = new Error("Compliance module registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

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
