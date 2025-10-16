import { portalGraphql } from "@/lib/settlemint/portal";
import { systemRouter } from "@/orpc/procedures/system.router";

const CLAIM_YIELD_MUTATION = portalGraphql(`
  mutation ClaimYield(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    claimYield: ISMARTFixedYieldScheduleClaimYield(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const claim = systemRouter.fixedYieldSchedule.claim.handler(
  async ({ input, context, errors }) => {
    const { contract, walletVerification } = input;
    const { auth, system } = context;

    if (!system) {
      throw errors.NOT_FOUND({
        message:
          "System context is missing. Cannot claim yield from yield schedule.",
      });
    }

    const sender = auth.user;

    const txHash = await context.portalClient.mutate(
      CLAIM_YIELD_MUTATION,
      {
        address: contract,
        from: sender.wallet,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return {
      txHash,
    };
  }
);
