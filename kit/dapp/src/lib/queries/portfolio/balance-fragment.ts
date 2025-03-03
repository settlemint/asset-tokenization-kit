import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { z } from "@/lib/utils/zod";
import type { infer as ZodInfer } from "zod";


export const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalanceFragment on AssetBalance {
    value
    asset {
      id
      name
      symbol
      type
      decimals
      ... on StableCoin {
        paused
      }
      ... on Bond {
        paused
      }
      ... on Fund {
        paused
      }
      ... on Equity {
        paused
      }
    }
  }
`);


export const BalanceFragmentSchema = z.object({
  value: z.bigInt(),
  asset: z.object({
    id: z.address(),
    name: z.string(),
    symbol: z.symbol(),
    type: z.string(),
    decimals: z.decimals(),
    paused: z.boolean().optional(),
  }),
});


export type BalanceFragmentType = ZodInfer<typeof BalanceFragmentSchema>;
