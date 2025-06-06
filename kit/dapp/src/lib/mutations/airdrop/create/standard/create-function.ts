import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { client } from "@/lib/settlemint/ipfs";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { AirdropDistributionListSchema } from "../common/airdrop-distribution-schema";
import {
  createMerkleTree,
  getMerkleProof,
  getMerkleRoot,
} from "../common/merkle-tree";
import type { CreateStandardAirdropInput } from "./create-schema";

const AirdropFactoryDeployStandardAirdrop = portalGraphql(`
mutation AirdropFactoryDeployStandardAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactory2DeployStandardAirdropInput!) {
    AirdropFactory2DeployStandardAirdrop(
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

  // Create merkle tree from the leaves
  const tree = createMerkleTree(leaves);

  // Create distribution object with merkle proofs for each recipient
  const distributionWithProofs = leaves.reduce(
    (acc, leaf) => {
      const proof = getMerkleProof(leaf, tree);
      acc[leaf.recipient] = {
        amount: leaf.amountExact.toString(),
        proof: proof,
      };
      return acc;
    },
    {} as Record<string, { amount: string; proof: string[] }>
  );

  const ipfs = await client.add(JSON.stringify(distributionWithProofs));

  const ipfsHash = ipfs.cid.toString();
  const name = "test2";

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
    result.AirdropFactory2DeployStandardAirdrop?.transactionHash;
  if (!createTxHash) {
    throw new Error(
      "Failed to create standard airdrop: no transaction hash received"
    );
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  const block = await waitForIndexingTransactions(hashes);

  return block;
};
