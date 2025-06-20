import { handleChallenge } from "@/lib/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/utils/zod/validators/ethereum-hash";

const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    ATKSystemFactoryCreateSystem(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

export const create = ar.system.create
  .use(
    permissionsMiddleware({
      requiredPermissions: ["create"],
      roles: ["admin"],
    })
  )
  .use(portalMiddleware)
  .handler(async ({ input, context }) => {
    const { contract, verification } = input;
    const sender = context.auth.user;

    // TODO: can we improve the error handling here and by default? It will come out as a generic 500 error.
    const result = await context.portalClient.request(CREATE_SYSTEM_MUTATION, {
      address: contract,
      from: sender.wallet,
      ...(await handleChallenge(sender, verification)),
    });

    return getEthereumHash(
      result.ATKSystemFactoryCreateSystem?.transactionHash
    );
  });
