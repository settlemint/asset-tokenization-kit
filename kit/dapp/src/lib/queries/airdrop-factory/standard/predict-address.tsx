"use server";
import { getUser } from "@/lib/auth/utils";
import { AIRDROP_FACTORY_ADDRESS } from "@/lib/contracts";
import { getMerkleRoot } from "@/lib/mutations/airdrop/create/common/merkle-tree";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import {
  PredictedStandardAirdropAddressSchema,
  type PredictStandardAirdropAddressInput,
} from "./schema";

/**
 * GraphQL query for predicting the address of a new standard airdrop
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateStandardAirdropPredictAddress = portalGraphql(`
  query CreateStandardAirdropPredictAddress($address: String!, $deployer: String!, $tokenAddress: String!, $merkleRoot: String!, $owner: String!, $startTime: String!, $endTime: String!) {
    AirdropFactory(address: $address) {
      predictStandardAirdropAddress(
        deployer: $deployer
        tokenAddress: $tokenAddress
        merkleRoot: $merkleRoot
        owner: $owner
        startTime: $startTime
        endTime: $endTime
      ) {
        predictedAddress
      }
    }
  }
`);

/**
 * Predicts the address of a new standard airdrop
 *
 * @param input - The data for creating a new standard airdrop
 * @returns The predicted address of the new standard airdrop
 */
export const getPredictedAddress = withTracing(
  "queries",
  "getPredictedAirdropAddress",
  async (input: PredictStandardAirdropAddressInput) => {
    const { asset, distribution, owner, startTime, endTime } = input;
    const user = await getUser();
    const merkleRoot = getMerkleRoot(distribution);

    const data = await portalClient.request(
      CreateStandardAirdropPredictAddress,
      {
        address: AIRDROP_FACTORY_ADDRESS,
        deployer: user.wallet,
        tokenAddress: asset.id,
        merkleRoot,
        owner,
        startTime: formatDate(startTime, { type: "unixSeconds" }),
        endTime: formatDate(endTime, { type: "unixSeconds" }),
      }
    );

    const predictedAddress = safeParse(
      PredictedStandardAirdropAddressSchema,
      data
    );

    return predictedAddress.AirdropFactory.predictStandardAirdropAddress
      .predictedAddress;
  }
);
