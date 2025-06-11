import { isIndexed } from "@/lib/orpc/helpers/block-indexing";
import { handleChallenge } from "@/lib/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/lib/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/utils/zod/validators/ethereum-hash";

const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation($address: String = "", $from: String = "", $challengeResponse: String = "", $verificationId: String = "") {
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

    const result = await context.portalClient.request(CREATE_SYSTEM_MUTATION, {
      address: contract,
      from: sender.wallet,
      ...(await handleChallenge(sender, verification)),
    });
    const transactionHash = getEthereumHash(
      result.ATKSystemFactoryCreateSystem?.transactionHash
    );
    await isIndexed([transactionHash]);

    // TODO: imagine i call ATKSystemFactoryCreateSystem on the portal, is there any way i can get the address of the deployed system? The only way i can think of is storing the txhash in deployedInTransaction in the subgraph, and then after waiting for indexing, fetching the system with that the txhash i have from sending the tx.
    return { id: "0x0000000000000000000000000000000000000000" };
  });
