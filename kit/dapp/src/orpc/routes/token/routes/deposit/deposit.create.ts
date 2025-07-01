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
import { z } from "zod/v4";

const CREATE_DEPOSIT_MUTATION = portalGraphql(`
  mutation CreateTokenMutation($address: String!, $from: String!, $input: ATKDepositFactoryImplementationCreateDepositInput!, $verificationId: String, $challengeResponse: String!) {
    CreateToken: ATKDepositFactoryImplementationCreateDeposit(
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

export const depositCreate = onboardedRouter.token.depositCreate
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(tokenFactoryMiddleware("deposit"))
  // .use(tokenFactoryPermissionMiddleware(["deployer"]))
  .handler(async ({ input, context }) => {
    const sender = context.auth.user;

    const result = await context.portalClient.query(
      CREATE_DEPOSIT_MUTATION,
      {
        address: context.tokenFactory.address,
        from: sender.wallet,
        input: {
          symbol_: input.symbol,
          name_: input.name,
          decimals_: input.decimals,
          initialModulePairs_: [],
          requiredClaimTopics_: [],
        },
        ...(await handleChallenge(sender, {
          code: "111111",
          type: "pincode",
        })),
      },
      z.object({
        CreateToken: z.object({
          transactionHash: ethereumHash,
        }),
      }),
      "Failed to create deposit"
    );

    // TODO: other operations to create a deposit (issue isin claim, grant roles, etc)

    return getEthereumHash(result.CreateToken.transactionHash);
  });
