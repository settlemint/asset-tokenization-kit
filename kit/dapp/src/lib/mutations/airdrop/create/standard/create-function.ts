import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { AirdropDistributionListSchema } from "../common/airdrop-distribution-schema";
import { getMerkleRoot } from "../common/merkle-tree";
import type { CreateStandardAirdropInput } from "./create-schema";

const AirdropFactoryDeployStandardAirdrop = portalGraphql(`
mutation AirdropFactoryDeployStandardAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployStandardAirdropInput!) {
    AirdropFactoryDeployStandardAirdrop2(
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
    // predictedAddress,
  },
  ctx: { user },
}: {
  parsedInput: CreateStandardAirdropInput;
  ctx: { user: User };
}) => {
  const leaves = safeParse(AirdropDistributionListSchema, distribution);

  // const ipfsHash = await client.add(
  //   JSON.stringify({
  //     "0x1234...": {
  //       amount: "1000000000000000000",
  //       proof: ["0xabc...", "0xdef...", "0x789..."],
  //     },
  //     "0x5678...": {
  //       amount: "2000000000000000000",
  //       proof: ["0x123...", "0x456...", "0x999..."],
  //     },
  //   })
  // );
  const ipfsHash = "QmRauxdYCwFKcTYALD7CxJ2EZNcVC8YPCZeTL4HfZEnGHG";
  const name = "test1";

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
        name,
        distributionIpfsHash: ipfsHash,
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
    result.AirdropFactoryDeployStandardAirdrop2?.transactionHash;
  if (!createTxHash) {
    throw new Error(
      "Failed to create standard airdrop: no transaction hash received"
    );
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  const block = await waitForIndexingTransactions(hashes);

  // await hasuraClient.request(AddAirdropDistribution, {
  //   objects: distribution.map((d) => ({
  //     airdrop_id: predictedAddress,
  //     recipient: d.recipient,
  //     amount: d.amount.toString(),
  //     amount_exact: d.amountExact,
  //     index: d.index,
  //   })),
  // });

  return block;
};
