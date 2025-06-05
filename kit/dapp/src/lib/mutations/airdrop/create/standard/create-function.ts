import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { hasuraClient } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { AddAirdropDistribution } from "../common/add-distribution";
import { AirdropDistributionListSchema } from "../common/airdrop-distribution-schema";
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
    predictedAddress,
  },
  ctx: { user },
}: {
  parsedInput: CreateStandardAirdropInput;
  ctx: { user: User };
}) => {
  const leaves = safeParse(AirdropDistributionListSchema, distribution);
  const result = await portalClient.request(
    AirdropFactoryDeployStandardAirdrop,
    {
      address: AIRDROP_FACTORY_ADDRESS,
      from: user.wallet,
      input: {
        tokenAddress: asset.id,
        merkleRoot: getMerkleRoot(leaves),
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
  const block = await waitForIndexingTransactions(hashes);

  await hasuraClient.request(AddAirdropDistribution, {
    objects: distribution.map((d) => ({
      airdrop_id: predictedAddress,
      recipient: d.recipient,
      amount: parseUnits(d.amount.toString(), asset.decimals).toString(),
      index: d.index,
    })),
  });

  return block;
};
