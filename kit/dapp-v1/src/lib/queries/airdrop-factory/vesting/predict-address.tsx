"use server";
import { getUser } from "@/lib/auth/utils";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { getMerkleRoot } from "@/lib/mutations/airdrop/create/common/merkle-tree";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate, getTimeUnitSeconds } from "@/lib/utils/date";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { PredictedAddressSchema, type PredictAddressInput } from "./schema";

const CreateVestingAirdropPredictAddress = portalGraphql(`
  query CreateVestingAirdropPredictAddress($address: String!, $deployer: String!, $tokenAddress: String!, $merkleRoot: String!, $owner: String!, $claimPeriodEnd: String!, $cliffDuration: String!, $vestingDuration: String!) {
    AirdropFactory(address: $address) {
      predictLinearVestingAirdropAddress(
        deployer: $deployer
        tokenAddress: $tokenAddress
        merkleRoot: $merkleRoot
        owner: $owner
        claimPeriodEnd: $claimPeriodEnd
        cliffDuration: $cliffDuration
        vestingDuration: $vestingDuration
      ) {
        predictedAirdropAddress
      }
    }
  }
`);

export const getPredictedAddress = withTracing(
  "queries",
  "getPredictedAddress",
  async (input: PredictAddressInput) => {
    const {
      asset,
      distribution,
      owner,
      claimPeriodEnd,
      cliffDuration,
      vestingDuration,
    } = input;
    const user = await getUser();
    const merkleRoot = getMerkleRoot(distribution);
    const data = await portalClient.request(
      CreateVestingAirdropPredictAddress,
      {
        address: AIRDROP_FACTORY_ADDRESS,
        deployer: user.wallet,
        tokenAddress: asset.id,
        merkleRoot,
        owner,
        claimPeriodEnd: formatDate(claimPeriodEnd, {
          type: "unixSeconds",
        }),
        cliffDuration: getTimeUnitSeconds(
          cliffDuration.value,
          cliffDuration.unit
        ).toString(),
        vestingDuration: getTimeUnitSeconds(
          vestingDuration.value,
          vestingDuration.unit
        ).toString(),
      }
    );

    const predictedAddress = safeParse(PredictedAddressSchema, data);

    return predictedAddress.AirdropFactory.predictLinearVestingAirdropAddress
      .predictedAirdropAddress;
  }
);
