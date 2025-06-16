import type { User } from "@/lib/auth/types";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreatePushAirdropInput } from "./create-schema";

// Dummy types for commented GraphQL operations
const AirdropFactoryDeployPushAirdrop = {} as any;

// const AirdropFactoryDeployPushAirdrop = portalGraphql(`
// mutation AirdropFactoryDeployPushAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployPushAirdropInput!) {
//     AirdropFactoryDeployPushAirdrop(
//     address: $address
//     from: $from
//     input: $input
//     challengeResponse: $challengeResponse
//     verificationId: $verificationId
//   ) {
//     transactionHash
//   }
// }
// `);

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
  // const result = await portalClient.request(AirdropFactoryDeployPushAirdrop, {
  //     address: AIRDROP_FACTORY_ADDRESS,
  //     from: user.wallet,
  //     input: {
  //       tokenAddress: asset.id,
  //       merkleRoot: getMerkleRoot(distribution),
  //       owner,
  //       distributionCap: parseUnits(
  //         distributionCap.toString(),
  //         asset.decimals
  //       ).toString(),
  //     },
  //     ...(await handleChallenge(
  //       user,
  //       user.wallet,
  //       verificationCode,
  //       verificationType
  //     )),
  //   });

  // const createTxHash = result.AirdropFactoryDeployPushAirdrop?.transactionHash;
  // NOTE: HARDCODED SO IT STILL COMPILES
  const createTxHash =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  if (!createTxHash) {
    throw new Error(
      "Failed to create push airdrop: no transaction hash received"
    );
  }
  const hashes = safeParse(t.Hashes(), [createTxHash]);
  const block = await waitForIndexingTransactions(hashes);

  // await hasuraClient.request(AddAirdropDistribution, {
  //   objects: distribution.map((d) => ({
  //     airdrop_id: predictedAddress,
  //     recipient: d.recipient,
  //     amount: parseUnits(d.amount.toString(), asset.decimals).toString(),
  //     index: d.index,
  //   })),
  // });

  return block;
};
