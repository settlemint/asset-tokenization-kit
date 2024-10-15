import { theGraphFallbackClient, theGraphFallbackGraphql } from "@/lib/settlemint/clientside/the-graph-fallback";
import { useSuspenseQuery } from "@tanstack/react-query";

const TokenDetails = theGraphFallbackGraphql(`
query TokenDetails($id: ID!) {
  erc20Contract(id: $id) {
    balances {
      account {
        id
        ERC20transferFromEvent {
          timestamp
        }
        ERC20transferToEvent {
          timestamp
        }
      }
      value
    }
    decimals
    extraData
    id
    name
    symbol
    totalSupply
    transfers {
      from {
        id
      }
      timestamp
      value
      to {
        id
      }
      transaction {
        id
        blockNumber
      }
    }
  }
}
    `);

export function useTokenDetails(address: string) {
  return useSuspenseQuery({
    queryKey: ["token-details", address],
    queryFn: () => {
      return theGraphFallbackClient.request(TokenDetails, { id: address });
    },
    refetchInterval: 10000,
  });
}
