import { theGraphFallbackClient, theGraphFallbackGraphql } from "@/lib/settlemint/clientside/the-graph-fallback";
import { useSuspenseQuery } from "@tanstack/react-query";

const TokenDetails = theGraphFallbackGraphql(`
  query TokenDetails($id: ID = "", $orderBy: ERC20Balance_orderBy = id, $orderDirection: OrderDirection = asc, $skip: Int = 10, $first: Int = 10, $first1: Int = 10, $orderBy1: ERC20Transfer_orderBy = id, $orderDirection1: OrderDirection = asc, $skip1: Int = 10) {
    erc20Contract(id: $id) {
      balances(
        orderBy: $orderBy
        orderDirection: $orderDirection
        skip: $skip
        first: $first
      ) {
        id
        value
      }
      decimals
      extraData
      id
      name
      symbol
      totalSupply
      transfers(
        first: $first1
        orderBy: $orderBy1
        orderDirection: $orderDirection1
        skip: $skip1
      ) {
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
  });
}
