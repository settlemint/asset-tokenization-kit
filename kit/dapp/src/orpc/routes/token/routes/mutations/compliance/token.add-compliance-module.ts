import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

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

export const addComplianceModule = tokenRouter.token.addComplianceModule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.addComplianceModule,
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, moduleAddress } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const { pendingMessage, successMessage, errorMessage } =
      getMutationMessages(t, "tokens", "addComplianceModule");

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
        params: JSON.stringify({}), // TODO: provide params as input to the request
        ...challengeResponse,
      },
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
