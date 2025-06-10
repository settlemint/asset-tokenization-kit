import type { User } from "@/lib/auth/types";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateVestingAirdropInput } from "./create-schema";

// Dummy types for commented GraphQL operations
const AirdropFactoryDeployLinearVestingAirdrop = {} as any;

// const AirdropFactoryDeployLinearVestingAirdrop = portalGraphql(`
// mutation AirdropFactoryDeployLinearVestingAirdrop($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: AirdropFactoryDeployLinearVestingAirdropInput!) {
//     AirdropFactoryDeployLinearVestingAirdrop(
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
    predictedAddress,
  },
  ctx: { user },
}: {
  parsedInput: CreateVestingAirdropInput;
  ctx: { user: User };
}) => {
  // const result = await portalClient.request(
  //     AirdropFactoryDeployLinearVestingAirdrop,
  //     {
  //       address: AIRDROP_FACTORY_ADDRESS,
  //       from: user.wallet,
  //       input: {
  //         tokenAddress: asset.id,
  //         merkleRoot: getMerkleRoot(distribution),
  //         owner,
  //         claimPeriodEnd: formatDate(claimPeriodEnd, {
  //           type: "unixSeconds",
  //         }),
  //         cliffDuration: getTimeUnitSeconds(
  //           cliffDuration.value,
  //           cliffDuration.unit
  //         ).toString(),
  //         vestingDuration: getTimeUnitSeconds(
  //           vestingDuration.value,
  //           vestingDuration.unit
  //         ).toString(),
  //       },
  //       ...(await handleChallenge(
  //         user,
  //         user.wallet,
  //         verificationCode,
  //         verificationType
  //       )),
  //     }
  //   );

  // const createTxHash = result.AirdropFactoryDeployLinearVestingAirdrop?.transactionHash;
  // NOTE: HARDCODED SO IT STILL COMPILES
  const createTxHash =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  if (!createTxHash) {
    throw new Error(
      "Failed to create vesting airdrop: no transaction hash received"
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
