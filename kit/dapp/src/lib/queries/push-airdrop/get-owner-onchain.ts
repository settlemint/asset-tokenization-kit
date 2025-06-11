"use server";

import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { Address } from "viem";

const GetPushAirdropOwnerOnChain = portalGraphql(`
  query GetPushAirdropOwnerOnChain($address: String!) {
    PushAirdrop(address: $address) {
      owner
    }
  }
`);

const PushAirdropOwnerSchema = t.Object({
  PushAirdrop: t.Object({
    owner: t.EthereumAddress(),
  }),
});

export const getPushAirdropOwnerOnChain = withTracing(
  "queries",
  "getPushAirdropOwnerOnChain",
  async (address: Address): Promise<Address> => {
    const response = await portalClient.request(GetPushAirdropOwnerOnChain, {
      address,
    });

    const data = safeParse(PushAirdropOwnerSchema, response);
    return data.PushAirdrop.owner;
  }
);
