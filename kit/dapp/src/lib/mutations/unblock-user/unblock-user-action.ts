"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { UnblockUserSchema } from "./unblock-user-schema";

const BondUnblockUser = portalGraphql(`
  mutation BondUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    BondUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const StableCoinUnblockUser = portalGraphql(`
  mutation StableCoinUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    StableCoinUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const EquityUnblockUser = portalGraphql(`
  mutation EquityUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    EquityUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const FundUnblockUser = portalGraphql(`
  mutation FundUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    FundUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

export const unblockUser = action
  .schema(UnblockUserSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: { address, pincode, userAddress, assettype },
      ctx: { user },
    }) => {
      // Common parameters for all mutations
      const params = {
        address,
        account: userAddress,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(BondUnblockUser, params);
          return safeParse(t.Hashes(), [
            response.BondUnblockUser?.transactionHash,
          ]);
        }
        case "equity": {
          const response = await portalClient.request(
            EquityUnblockUser,
            params
          );
          return safeParse(t.Hashes(), [
            response.EquityUnblockUser?.transactionHash,
          ]);
        }
        case "fund": {
          const response = await portalClient.request(FundUnblockUser, params);
          return safeParse(t.Hashes(), [
            response.FundUnblockUser?.transactionHash,
          ]);
        }
        case "stablecoin": {
          const response = await portalClient.request(
            StableCoinUnblockUser,
            params
          );
          return safeParse(t.Hashes(), [
            response.StableCoinUnblockUser?.transactionHash,
          ]);
        }
        case "cryptocurrency": {
          throw new Error(
            "Cryptocurrency does not support unblock user operations"
          );
        }
        case "tokenizeddeposit": {
          throw new Error(
            "Tokenized deposit does not support unblock user operations"
          );
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
