import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { TokenRemoveComplianceModuleMessagesSchema } from "./token.remove-compliance-module.schema";

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
    .handler(async function* ({ input, context }) {
      const { contract, verification, moduleAddress } = input;
      const { auth } = context;

      // Parse messages with defaults
      const messages = TokenRemoveComplianceModuleMessagesSchema.parse(
        input.messages ?? {}
      );

      const sender = auth.user;
      const challengeResponse = await handleChallenge(sender, {
        code: verification.verificationCode,
        type: verification.verificationType,
      });

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_REMOVE_COMPLIANCE_MODULE_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          moduleAddress,
          ...challengeResponse,
        },
        messages.complianceModuleRemovalFailed,
        messages
      );

      return getEthereumHash(transactionHash);
    });
