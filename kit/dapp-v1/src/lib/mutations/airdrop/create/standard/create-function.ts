import type { User } from "@/lib/auth/types";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateStandardAirdropInput } from "./create-schema";

// Dummy types for commented GraphQL operations
const AirdropFactoryDeployStandardAirdrop = {} as any;

// const AirdropFactoryDeployStandardAirdrop = portalGraphql(`
// mutation AirdropFactoryDeployStandardAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployStandardAirdropInput!) {
//     AirdropFactoryDeployStandardAirdrop(
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
  // const result = await portalClient.request(
  //     AirdropFactoryDeployStandardAirdrop,
  //     {
  //       address: AIRDROP_FACTORY_ADDRESS,
  //       from: user.wallet,
  //       input: {
  //         tokenAddress: asset.id,
  //         merkleRoot: getMerkleRoot(distribution),
  //         owner,
  //         startTime: formatDate(startTime, {
  //           type: "unixSeconds",
  //         }),
  //         endTime: formatDate(endTime, {
  //           type: "unixSeconds",
  //         }),
  //       },
  //       ...(await handleChallenge(
  //         user,
  //         user.wallet,
  //         verificationCode,
  //         verificationType
  //       )),
  //     }
  //   );

  // const createTxHash = result.AirdropFactoryDeployStandardAirdrop?.transactionHash;
  // NOTE: HARDCODED SO IT STILL COMPILES
  const createTxHash =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
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
  //     amount: parseUnits(d.amount.toString(), asset.decimals).toString(),
  //     index: d.index,
  //   })),
  // });

  return block;
};
