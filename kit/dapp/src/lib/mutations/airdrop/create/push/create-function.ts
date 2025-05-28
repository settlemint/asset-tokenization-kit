import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { hasuraClient } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { AddAirdropDistribution } from "../common/add-distribution";
import { getMerkleRoot } from "../common/merkle-tree";
import type { CreatePushAirdropInput } from "./create-schema";

const AirdropFactoryDeployPushAirdrop = portalGraphql(`
mutation AirdropFactoryDeployPushAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployPushAirdropInput!) {
    AirdropFactoryDeployPushAirdrop(
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

export const createPushAirdropFunction = async ({
  parsedInput: {
    asset,
    distribution,
    owner,
    distributionCap,
    verificationCode,
    verificationType,
    predictedAddress,
  },
  ctx: { user },
}: {
  parsedInput: CreatePushAirdropInput;
  ctx: { user: User };
}) => {
  const result = await portalClient.request(AirdropFactoryDeployPushAirdrop, {
    address: AIRDROP_FACTORY_ADDRESS,
    from: user.wallet,
    input: {
      tokenAddress: asset.id,
      merkleRoot: getMerkleRoot(distribution),
      owner,
      distributionCap: parseUnits(
        distributionCap.toString(),
        asset.decimals
      ).toString(),
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const createTxHash = result.AirdropFactoryDeployPushAirdrop?.transactionHash;
  if (!createTxHash) {
    throw new Error(
      "Failed to create push airdrop: no transaction hash received"
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
