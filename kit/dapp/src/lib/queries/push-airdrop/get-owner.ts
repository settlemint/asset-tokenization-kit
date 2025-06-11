"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { Address } from "viem";

const GetPushAirdropOwner = theGraphGraphqlKit(`
  query GetPushAirdropOwner($id: ID!) {
    pushAirdrop(id: $id) {
      owner {
        id
      }
    }
  }
`);

const PushAirdropOwnerSchema = t.Object({
  pushAirdrop: t.Object({
    owner: t.Object({
      id: t.EthereumAddress(),
    }),
  }),
});

export const getPushAirdropOwner = withTracing(
  "queries",
  "getPushAirdropOwner",
  async (address: Address): Promise<Address> => {
    const response = await theGraphClientKit.request(
      GetPushAirdropOwner,
      { id: address },
      {
        "X-GraphQL-Operation-Name": "GetPushAirdropOwner",
        "X-GraphQL-Operation-Type": "query",
      }
    );

    const data = safeParse(PushAirdropOwnerSchema, response);
    return data.pushAirdrop.owner.id;
  }
);
