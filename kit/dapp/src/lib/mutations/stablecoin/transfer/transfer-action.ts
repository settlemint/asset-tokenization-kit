"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z, type ZodInfer } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { TransferStableCoinSchema } from "./transfer-schema";

export const TransferStableCoin = portalGraphql(`
  mutation TransferStableCoin($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: StableCoinTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export async function transfer(
  input: ZodInfer<typeof TransferStableCoinSchema>
) {
  TransferStableCoinSchema.parse(input);

  const response = await portalClient.request(TransferStableCoin, {
    address: input.address,
    from: input.user.wallet,
    to: input.to,
    value: parseUnits(input.value.toString(), input.decimals).toString(),
    challengeResponse: await handleChallenge(input.user.wallet, input.pincode),
  });

  return z.hashes().parse([response.Transfer?.transactionHash]);
}
