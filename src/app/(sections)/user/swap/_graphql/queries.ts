import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";

// TODO: I do not like the indexing output one bit, we should simplify based on what we need and take a look at the uniswap indexing code for best practices
export const GetSellableTokens = theGraphGraphql(`
  query GetSellableTokens($account: String!) {
    erc20Balances(
      where: {account: $account, valueExact_gt: "0"}
    ) {
      contract {
        id
        name
        symbol
        pairsBaseToken {
          id
          quoteTokenPrice
          swapFee
          baseReserve
          quoteReserve
          baseReserveExact
          quoteReserveExact
          quoteToken {
            id
            name
            symbol
          }
        }
      }
      valueExact
      value
    }
  }
  `);

export const SwapTokenReceiptQuery = portalGraphql(`
  query SwapTokenReceiptQuery($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      receipt {
        contractAddress
        status
        blockNumber
      }
    }
  }`);
