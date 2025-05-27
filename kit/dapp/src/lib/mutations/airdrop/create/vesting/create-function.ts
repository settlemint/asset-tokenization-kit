import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateVestingAirdropInput } from "./create-schema";

const AirdropFactoryDeployLinearVestingAirdrop = portalGraphql(`
mutation AirdropFactoryDeployLinearVestingAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployLinearVestingAirdropInput!) {
    AirdropFactoryDeployLinearVestingAirdrop(
    address: $address
    from: $from
    input: $input
    challengeResponse: $challengeResponse
    verificationId: $verificationId
  ) {
    transactionHash
  }
}
`);

export const createVestingAirdropFunction = async ({
  parsedInput: {
    asset,
    distribution,
    owner,
    claimPeriodEnd,
    cliffDuration,
    vestingDuration,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: CreateVestingAirdropInput;
  ctx: { user: User };
}) => {
  const result = await portalClient.request(
    AirdropFactoryDeployLinearVestingAirdrop,
    {
      address: AIRDROP_FACTORY_ADDRESS,
      from: user.wallet,
      input: {
        tokenAddress: asset.id,
        merkleRoot: "",
        owner,
        claimPeriodEnd: formatDate(claimPeriodEnd, {
          type: "unixSeconds",
        }),
        cliffDuration: formatDate(cliffDuration, {
          type: "unixSeconds",
        }),
        vestingDuration: formatDate(vestingDuration, {
          type: "unixSeconds",
        }),
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    }
  );

  const createTxHash =
    result.AirdropFactoryDeployLinearVestingAirdrop?.transactionHash;
  if (!createTxHash) {
    throw new Error(
      "Failed to create vesting airdrop: no transaction hash received"
    );
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  return await waitForIndexingTransactions(hashes);
};
