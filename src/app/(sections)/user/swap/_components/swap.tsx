"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, Info } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";

// Token type definition
type Token = {
  symbol: string;
  name: string;
  icon: string;
  balance?: string;
};

const tokens: Token[] = [
  { symbol: "ETH", name: "Ethereum", icon: "🔷" },
  { symbol: "USDC", name: "USD Coin", icon: "💵" },
  { symbol: "USDT", name: "Tether USD", icon: "💚" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "₿" },
  { symbol: "WETH", name: "Wrapped Ethereum", icon: "⬡" },
];

const GetSellableTokens = theGraphGraphql(`
query GetSellableTokens($account: String!) {
  erc20Balances(
    where: {account: $account, valueExact_gt: "0"}
  ) {
    contract {
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
      }
    }
    valueExact
    value
  }
}
`);

export function Swap({ address }: { address: Address }) {
  const pairs = useSuspenseQuery({
    queryKey: ["pairs-for-swap", address],
    queryFn: () => {
      return theGraphClient.request(GetSellableTokens, { account: address });
    },
    refetchInterval: 10000,
  });
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [selectedSellToken, setSelectedSellToken] = useState<Token>();
  const [selectedBuyToken, setSelectedBuyToken] = useState<Token>();

  const sellablePairs = (pairs.data?.erc20Balances ?? [])
    .filter((pair) => pair.contract.symbol !== selectedBuyToken?.symbol)
    .filter((pair) =>
      (pair.contract.pairsBaseToken ?? []).some((p) => Number(p.baseReserve) > 0 && Number(p.quoteReserve) > 0),
    );

  if (!sellablePairs.length) {
    return <div>No trading pairs with liquidity avaialble for you</div>;
  }

  return (
    <div className="p-4">
      <div className="mx-auto max-w-md space-y-4">
        <Card className="border-none">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="text-lg">Sell</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(Number(e.target.value))}
                  className="border-none bg-transparent text-4xl h-12"
                />
                <Select
                  onValueChange={(value) => setSelectedSellToken(tokens.find((token) => token.symbol === value)!)}
                  value={selectedSellToken?.symbol}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a token to sell" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellablePairs.map((pair) => (
                      <SelectItem key={pair.contract.symbol} value={pair.contract.symbol}>
                        {pair.contract.name} ({pair.contract.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">$257,702.79</div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full bg-neutral-800 p-4">
                <ArrowDown className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-lg text-gray-300">Buy</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Number(e.target.value))}
                  className="border-none bg-transparent text-4xl h-12"
                />
                <Select
                  onValueChange={(value) => setSelectedBuyToken(tokens.find((token) => token.symbol === value)!)}
                  value={selectedBuyToken?.symbol}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a token to buy">
                      {selectedBuyToken ? `${selectedBuyToken.name} (${selectedBuyToken.symbol})` : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tokens
                      .filter((token) => token.symbol !== selectedSellToken?.symbol)
                      .map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">$255,768.88</div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">Swap</Button>

        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Fee (0.25%) <Info className="h-4 w-4" />
              </div>
              <span>$641.02</span>
            </div>

            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Price impact <Info className="h-4 w-4" />
              </div>
              <span>0%</span>
            </div>

            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Max slippage <Info className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1">
                <span>0.50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
