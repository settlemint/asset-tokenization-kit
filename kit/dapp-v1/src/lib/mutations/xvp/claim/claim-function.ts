import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { ClaimXvpInput } from "./claim-schema";

// Dummy types for commented GraphQL operations
const ClaimXvp = {} as any;

// const ClaimXvp = portalGraphql(`
//   mutation ClaimXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     XvPSettlementExecute(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

export const claimXvpFunction = async ({
  parsedInput: { verificationCode, verificationType, xvp },
  ctx: { user },
}: {
  parsedInput: ClaimXvpInput;
  ctx: { user: User };
}) => {
  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  // const result = await portalClient.request(ClaimXvp, {
  //   challengeResponse: challengeResponse.challengeResponse,
  //   verificationId: challengeResponse.verificationId,
  //   address: xvp,
  //   from: user.wallet,
  // });
  // NOTE: HARDCODED SO IT STILL COMPILES
  const mockTxHash =
    "0x567890123ef567890123ef567890123ef567890123ef567890123ef567890";
  return safeParse(t.Hashes(), [mockTxHash]);
};
