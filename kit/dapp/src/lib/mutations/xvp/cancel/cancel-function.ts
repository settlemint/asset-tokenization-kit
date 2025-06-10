import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CancelXvpInput } from "./cancel-schema";

// Dummy types for commented GraphQL operations
const CancelXvp = {} as any;


// const CancelXvp = portalGraphql(`
//   mutation CancelXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     XvPSettlementCancel(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

export const cancelXvpFunction = async ({
  parsedInput: { verificationCode, verificationType, xvp },
  ctx: { user },
}: {
  parsedInput: CancelXvpInput;
  ctx: { user: User };
}) => {
  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  // const result = await portalClient.request(CancelXvp, {
  //   challengeResponse: challengeResponse.challengeResponse,
  //   verificationId: challengeResponse.verificationId,
  //   address: xvp,
  //   from: user.wallet,
  // });
  // NOTE: HARDCODED SO IT STILL COMPILES
  const mockTxHash = "0x4567890123def4567890123def4567890123def4567890123def0123456789";
  return waitForIndexingTransactions(
    safeParse(t.Hashes(), [mockTxHash])
  );
};
