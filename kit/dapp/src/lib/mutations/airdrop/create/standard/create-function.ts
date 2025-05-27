import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { getMerkleRoot } from "../common/merkle-tree";
import type { CreateStandardAirdropInput } from "./create-schema";

const AirdropFactoryDeployStandardAirdrop = portalGraphql(`
mutation AirdropFactoryDeployStandardAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployStandardAirdropInput!) {
    AirdropFactoryDeployStandardAirdrop(
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

export const createStandardAirdropFunction = async ({
  parsedInput: {
    asset,
    distribution,
    owner,
    startTime,
    endTime,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: CreateStandardAirdropInput;
  ctx: { user: User };
}) => {
  const result = await portalClient.request(
    AirdropFactoryDeployStandardAirdrop,
    {
      address: AIRDROP_FACTORY_ADDRESS,
      from: user.wallet,
      input: {
        tokenAddress: asset.id,
        merkleRoot: getMerkleRoot(distribution),
        owner,
        startTime: formatDate(startTime, {
          type: "unixSeconds",
        }),
        endTime: formatDate(endTime, {
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
    result.AirdropFactoryDeployStandardAirdrop?.transactionHash;
  if (!createTxHash) {
    throw new Error(
      "Failed to create standard airdrop: no transaction hash received"
    );
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  return await waitForIndexingTransactions(hashes);
};
