import { GetSellableTokens } from "@/app/(sections)/user/swap/_graphql/queries";
import { theGraphClient } from "@/lib/settlemint/the-graph";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Address } from "viem";

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  balance?: string;
  balanceExact?: string;
}

export interface PairInfo {
  pairId: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserve0: string;
  reserve1: string;
  reserve0Exact: string;
  reserve1Exact: string;
  swapFee: string;
  price: string;
  isBaseToQuote: boolean;
}

export interface ProcessedTokenData {
  tokens: Map<string, TokenInfo>;
  pairs: PairInfo[];
  tokensBySymbol: Map<string, TokenInfo>;
  validInputTokens: TokenInfo[];
  getOutputTokensForInput: (inputTokenSymbol: string) => TokenInfo[];
  findPairByTokens: (token0Symbol: string, token1Symbol: string) => PairInfo | undefined;
}

interface RawTokenBalance {
  contract: {
    id: string;
    name: string;
    symbol: string;
    pairsBaseToken?: Array<{
      id: string;
      quoteTokenPrice: string;
      swapFee: string;
      baseReserve: string;
      quoteReserve: string;
      baseReserveExact: string;
      quoteReserveExact: string;
      quoteToken: {
        id: string;
        name: string;
        symbol: string;
      };
    }>;
  };
  value: string;
  valueExact: string;
}

interface RawPairsData {
  erc20Balances?: RawTokenBalance[];
}

export function useSwapTokens(address: Address): ProcessedTokenData {
  const { data: rawPairsData } = useSuspenseQuery({
    queryKey: ["pairs-for-swap", address],
    queryFn: () => theGraphClient.request(GetSellableTokens, { account: address }),
  });

  return useMemo(() => {
    const tokens = new Map<string, TokenInfo>();
    const tokensBySymbol = new Map<string, TokenInfo>();
    const pairs: PairInfo[] = [];

    // Process raw token balances and their pairs
    for (const balance of rawPairsData?.erc20Balances ?? []) {
      const baseToken: TokenInfo = {
        address: balance.contract.id,
        symbol: balance.contract.symbol,
        name: balance.contract.name,
        balance: balance.value,
        balanceExact: balance.valueExact,
      };

      // Add base token to maps
      tokens.set(baseToken.address, baseToken);
      tokensBySymbol.set(baseToken.symbol, baseToken);

      // Process pairs for this token
      if (balance.contract.pairsBaseToken) {
        for (const pair of balance.contract.pairsBaseToken) {
          const quoteToken: TokenInfo = {
            address: pair.quoteToken.id,
            symbol: pair.quoteToken.symbol,
            name: pair.quoteToken.name,
          };

          // Add quote token to maps if not exists
          if (!tokens.has(quoteToken.address)) {
            tokens.set(quoteToken.address, quoteToken);
            tokensBySymbol.set(quoteToken.symbol, quoteToken);
          }

          // Create pair info
          pairs.push({
            pairId: pair.id,
            token0: baseToken,
            token1: quoteToken,
            reserve0: pair.baseReserve,
            reserve1: pair.quoteReserve,
            reserve0Exact: pair.baseReserveExact,
            reserve1Exact: pair.quoteReserveExact,
            swapFee: pair.swapFee,
            price: pair.quoteTokenPrice,
            isBaseToQuote: true,
          });
        }
      }
    }

    // Get tokens that have a balance and are in at least one pair
    const validInputTokens = Array.from(tokens.values()).filter((token) => token.balance && Number(token.balance) > 0);

    // Helper to get possible output tokens for a given input token
    const getOutputTokensForInput = (inputTokenSymbol: string): TokenInfo[] => {
      const outputTokens = new Set<TokenInfo>();

      for (const pair of pairs) {
        if (pair.token0.symbol === inputTokenSymbol) {
          outputTokens.add(pair.token1);
        } else if (pair.token1.symbol === inputTokenSymbol) {
          outputTokens.add(pair.token0);
        }
      }

      return Array.from(outputTokens);
    };

    // Helper to find a specific pair by token symbols
    const findPairByTokens = (token0Symbol: string, token1Symbol: string): PairInfo | undefined => {
      const pair = pairs.find(
        (pair) =>
          (pair.token0.symbol === token0Symbol && pair.token1.symbol === token1Symbol) ||
          (pair.token0.symbol === token1Symbol && pair.token1.symbol === token0Symbol),
      );

      if (!pair) return undefined;

      // If the order matches the original pair order, use the original isBaseToQuote
      // If the order is reversed, flip isBaseToQuote
      const isReversed = pair.token0.symbol === token1Symbol;
      return {
        ...pair,
        isBaseToQuote: isReversed ? !pair.isBaseToQuote : pair.isBaseToQuote,
      };
    };

    return {
      tokens,
      pairs,
      tokensBySymbol,
      validInputTokens,
      getOutputTokensForInput,
      findPairByTokens,
    };
  }, [rawPairsData]);
}
