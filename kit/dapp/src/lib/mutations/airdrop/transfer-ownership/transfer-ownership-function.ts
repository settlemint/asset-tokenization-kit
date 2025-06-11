"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
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

  switch (type) {
    case AirdropTypeEnum.push: {
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
