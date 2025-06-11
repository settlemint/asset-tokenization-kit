"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getPushAirdropOwner } from "@/lib/queries/push-airdrop/get-owner";
import { getPushAirdropOwnerOnChain } from "@/lib/queries/push-airdrop/get-owner-onchain";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { AirdropTypeEnum } from "@/lib/utils/typebox/airdrop-types";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { AirdropTransferOwnershipInput } from "./transfer-ownership-schema";

/**
 * GraphQL mutation to transfer ownership of a push airdrop contract
 */
const PushAirdropTransferOwnership = portalGraphql(`
  mutation PushAirdropTransferOwnership($address: String!, $from: String!, $input: PushAirdropTransferOwnershipInput!, $challengeResponse: String!, $verificationId: String) {
    PushAirdropTransferOwnership(
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

/**
 * GraphQL mutation to transfer ownership of a standard airdrop contract
 */
const StandardAirdropTransferOwnership = portalGraphql(`
  mutation StandardAirdropTransferOwnership($address: String!, $from: String!, $input: StandardAirdropTransferOwnershipInput!, $challengeResponse: String!, $verificationId: String) {
    StandardAirdropTransferOwnership(
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

/**
 * GraphQL mutation to transfer ownership of a vesting airdrop contract
 */
const VestingAirdropTransferOwnership = portalGraphql(`
  mutation VestingAirdropTransferOwnership($address: String!, $from: String!, $input: VestingAirdropTransferOwnershipInput!, $challengeResponse: String!, $verificationId: String) {
    VestingAirdropTransferOwnership(
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

/**
 * Function to transfer ownership of an airdrop contract
 *
 * @param input - Validated input containing address, newOwner, verificationCode, verificationType, and type
 * @param user - The user executing the transfer operation
 * @returns Array of transaction hashes
 */
export const airdropTransferOwnershipFunction = async ({
  parsedInput: { address, newOwner, verificationCode, verificationType, type },
  ctx: { user },
}: {
  parsedInput: AirdropTransferOwnershipInput;
  ctx: { user: User };
}) => {
  // Common parameters for all mutations
  const params: VariablesOf<
    | typeof PushAirdropTransferOwnership
    | typeof StandardAirdropTransferOwnership
    | typeof VestingAirdropTransferOwnership
  > = {
    address,
    from: user.wallet,
    input: {
      newOwner,
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  };

  console.log(type);
  console.log(address);
  console.log(newOwner);

  switch (type) {
    case AirdropTypeEnum.push: {
      // Check both subgraph and on-chain owner
      const [subgraphOwner, onChainOwner] = await Promise.all([
        getPushAirdropOwner(address),
        getPushAirdropOwnerOnChain(address),
      ]);

      console.log('Subgraph owner:', subgraphOwner);
      console.log('On-chain owner:', onChainOwner);

      if (onChainOwner.toLowerCase() !== user.wallet.toLowerCase()) {
        throw new Error(`You are not the owner of this airdrop. Current on-chain owner is ${onChainOwner}`);
      }

      if (subgraphOwner.toLowerCase() !== onChainOwner.toLowerCase()) {
        console.warn('Warning: Subgraph owner data is out of sync with blockchain');
      }

      const response = await portalClient.request(
        PushAirdropTransferOwnership,
        params
      );
      return waitForIndexingTransactions(
        safeParse(t.Hashes(), [
          response.PushAirdropTransferOwnership?.transactionHash,
        ])
      );
    }
    case AirdropTypeEnum.standard: {
      const response = await portalClient.request(
        StandardAirdropTransferOwnership,
        params
      );
      return waitForIndexingTransactions(
        safeParse(t.Hashes(), [
          response.StandardAirdropTransferOwnership?.transactionHash,
        ])
      );
    }
    case AirdropTypeEnum.vesting: {
      const response = await portalClient.request(
        VestingAirdropTransferOwnership,
        params
      );
      return waitForIndexingTransactions(
        safeParse(t.Hashes(), [
          response.VestingAirdropTransferOwnership?.transactionHash,
        ])
      );
    }
    default:
      throw new Error("Invalid airdrop type");
  }
};
