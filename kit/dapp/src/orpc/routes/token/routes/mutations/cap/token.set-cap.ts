import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_SET_CAP_MUTATION = portalGraphql(`
  mutation TokenSetCap(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $newCap: String!
  ) {
    setCap: ISMARTCappedSetCap(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        newCap: $newCap
      }
    ) {
      transactionHash
    }
  }
`);

export const setCap = tokenRouter.token.setCap
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.setCap,
      requiredExtensions: ["CAPPED"],
    })
  )

  .handler(async ({ input, context }) => {
    const { contract, verification, newCap } = input;
    const { auth } = context;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
    await context.portalClient.mutate(TOKEN_SET_CAP_MUTATION, {
      address: contract,
      from: sender.wallet,
      newCap: newCap.toString(),
      ...challengeResponse,
    });

    // Return the updated token data using the read handler
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
