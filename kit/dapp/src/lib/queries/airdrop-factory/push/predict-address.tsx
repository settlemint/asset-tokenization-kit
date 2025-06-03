"use server";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { getMerkleRoot } from "@/lib/mutations/airdrop/create/common/merkle-tree";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import {
  PredictedPushAirdropAddressSchema,
  type PredictPushAirdropAddressInput,
} from "./schema";

const CreatePushAirdropPredictAddress = portalGraphql(`
  query CreatePushAirdropPredictAddress($address: String!, $tokenAddress: String!, $merkleRoot: String!, $owner: String!, $distributionCap: String!) {
    AirdropFactory(address: $address) {
      predictPushAirdropAddress(
        tokenAddress: $tokenAddress
        merkleRoot: $merkleRoot
        owner: $owner
        distributionCap: $distributionCap
      ) {
        predictedAddress
      }
    }
  }
`);
/**
 * Predicts the address of a new push airdrop
 *
 * @param input - The data for creating a new push airdrop
 * @returns The predicted address of the new push airdrop
 */
export const getPredictedAddress = withTracing(
  "queries",
  "getPredictedAirdropAddress",
  async (input: PredictPushAirdropAddressInput) => {
    const { asset, distribution, owner, distributionCap } = input;
    const merkleRoot = getMerkleRoot(distribution);
    const data = await portalClient.request(CreatePushAirdropPredictAddress, {
      address: AIRDROP_FACTORY_ADDRESS,
      tokenAddress: asset.id,
      merkleRoot,
      owner,
      distributionCap: distributionCap.toString(),
    });

    const predictedAddress = safeParse(PredictedPushAirdropAddressSchema, data);

    return predictedAddress.AirdropFactory.predictPushAirdropAddress
      .predictedAddress;
  }
);
