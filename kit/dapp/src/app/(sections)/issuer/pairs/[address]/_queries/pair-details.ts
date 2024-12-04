import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { useSuspenseQuery } from "@tanstack/react-query";

const PairDetails = theGraphGraphql(`
query PairDetails($id: ID!) {
  erc20DexPair(id: $id) {
    baseToken {
      name
      symbol
      decimals
      totalSupply
      id
    }
    baseReserve
    baseTokenPrice
    decimals
    id
    name
    quoteReserve
    quoteToken {
      id
      name
      decimals
      symbol
      totalSupply
    }
    quoteTokenPrice
    swapFee
    symbol
    totalSupply
    stakes {
      value
      account {
        id
      }
    }
  }
}
    `);

export function usePairDetails(address: string) {
  return useSuspenseQuery({
    queryKey: ["pair-details", address],
    queryFn: () => {
      return theGraphClient.request(PairDetails, { id: address });
    },
    refetchInterval: 2000,
  });
}
