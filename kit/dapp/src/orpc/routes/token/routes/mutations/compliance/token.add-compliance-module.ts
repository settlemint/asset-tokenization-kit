import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenAddComplianceModuleMessagesSchema } from "./token.add-compliance-module.schema";

const TOKEN_ADD_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
  mutation TokenAddComplianceModule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $moduleAddress: String!
  ) {
    addComplianceModule: IERC3643AddComplianceModule(
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

export const tokenAddComplianceModule =
  tokenRouter.token.tokenAddComplianceModule
    .use(portalMiddleware)
    .handler(async function* ({ input, context, errors }) {
      const { contract, verification, moduleAddress } = input;
      const { auth } = context;

      // Parse messages with defaults
      const messages = TokenAddComplianceModuleMessagesSchema.parse(
        input.messages ?? {}
      );

      // Validate that the token supports compliance management
      const supportsCompliance = await supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.IERC3643
      );

      if (!supportsCompliance) {
        throw errors.FORBIDDEN({
          message:
            "Token does not support compliance management. The token must implement IERC3643 interface.",
        });
      }

      const sender = auth.user;
      const challengeResponse = await handleChallenge(sender, {
        code: verification.verificationCode,
        type: verification.verificationType,
      });

      const transactionHash = yield* context.portalClient.mutate(
        TOKEN_ADD_COMPLIANCE_MODULE_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          moduleAddress,
          ...challengeResponse,
        },
        messages.complianceModuleFailed,
        messages
      );

      return getEthereumHash(transactionHash);
    });
