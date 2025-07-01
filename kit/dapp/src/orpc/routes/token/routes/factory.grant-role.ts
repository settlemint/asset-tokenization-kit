import { portalGraphql } from "@/lib/settlemint/portal";
import {
  ethereumHash,
  getEthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { tokenFactoryMiddleware } from "@/orpc/middlewares/system/token-factory.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { keccak256, toBytes } from "viem";
import { z } from "zod/v4";

// Generate the DEPLOYER_ROLE hash
const DEPLOYER_ROLE = keccak256(toBytes("DEPLOYER_ROLE"));

const GRANT_ROLE_MUTATION = portalGraphql(`
  mutation GrantRoleMutation($address: String!, $from: String!, $input: ATKDepositFactoryImplementationGrantRoleInput!, $verificationId: String, $challengeResponse: String!) {
    GrantRole: ATKDepositFactoryImplementationGrantRole(
      address: $address
      from: $from
      input: $input
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const factoryGrantRole = onboardedRouter.token.factoryGrantRole
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(tokenFactoryMiddleware("deposit"))
  .handler(async ({ context }) => {
    const sender = context.auth.user;

    const result = await context.portalClient.query(
      GRANT_ROLE_MUTATION,
      {
        address: context.tokenFactory.address,
        from: sender.wallet ?? "",
        input: {
          role: DEPLOYER_ROLE,
          account: sender.wallet ?? "",
        },
        ...(await handleChallenge(sender, {
          code: "111111",
          type: "pincode",
        })),
      },
      z.object({
        GrantRole: z.object({
          transactionHash: ethereumHash,
        }),
      }),
      "Failed to grant role"
    );

    return getEthereumHash(result.GrantRole.transactionHash);
  });
