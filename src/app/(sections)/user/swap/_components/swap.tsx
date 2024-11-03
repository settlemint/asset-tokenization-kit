"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTokenValue } from "@/lib/number";
import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import type { Address } from "viem";

// TODO: Literally the worst component I've ever written, needs a complete rewrite
//    - Look at uniswap on what it should look like and behave like
//    - We need to volidate the math here, it is completely untested
//    - and i think we should explain the math as well. Maybe it makes sense to have a default help system?

// Token type definition
type Token = {
  contract: {
    name: string;
    symbol: string;
    pairsBaseToken: {
      id: string;
      quoteTokenPrice: string;
      swapFee: string;
      baseReserve: string;
      quoteReserve: string;
      baseReserveExact: string;
      quoteReserveExact: string;
      quoteToken: {
        name: string;
        symbol: string;
      };
    }[];
  };
  valueExact: string;
  value: string;
};

// TODO: I do not like the indexing output one bit, we should simplify based on what we need and take a look at the uniswap indexing code for best practices
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
        quoteToken {
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

const SwapBaseToQuote = portalGraphql(`
  mutation SwapBaseToQuote($address: String!, $from: String!, $baseAmount: String!, $minQuoteAmount: String!, $deadline: String!) {
    StarterKitERC20DexSwapBaseToQuote(
      address: $address
      from: $from
      input: {baseAmount: $baseAmount, minQuoteAmount: $minQuoteAmount, deadline: $deadline}
      gasLimit: "2000000"
    ) {
      transactionHash
    }
  }
`);

const SwapQuoteToBase = portalGraphql(`
  mutation SwapQuoteToBase($address: String!, $from: String!, $quoteAmount: String!, $minBaseAmount: String!, $deadline: String!) {
    StarterKitERC20DexSwapQuoteToBase(
      address: $address
      from: $from
      input: {quoteAmount: $quoteAmount, minBaseAmount: $minBaseAmount, deadline: $deadline}
      gasLimit: "2000000"
    ) {
      transactionHash
    }
  }
`);

function calculatePriceImpact({
  sellAmount,
  baseReserve,
  quoteReserve,
}: {
  sellAmount: number;
  baseReserve: string;
  quoteReserve: string;
}): number {
  if (!sellAmount || !baseReserve || !quoteReserve) return 0;

  const baseReserveNum = Number(baseReserve);
  const quoteReserveNum = Number(quoteReserve);

  // Current price
  const currentPrice = quoteReserveNum / baseReserveNum;

  // New reserves after swap
  const newBaseReserve = baseReserveNum + sellAmount;
  const newQuoteReserve = (baseReserveNum * quoteReserveNum) / newBaseReserve;

  // New price
  const newPrice = newQuoteReserve / newBaseReserve;

  // Calculate price impact
  const priceImpact = Math.abs((newPrice - currentPrice) / currentPrice) * 100;

  return Math.min(priceImpact, 100);
}

export function Swap({ address }: { address: Address }) {
  const pairs = useSuspenseQuery({
    queryKey: ["pairs-for-swap", address],
    queryFn: () => {
      return theGraphClient.request(GetSellableTokens, { account: address });
    },
    refetchInterval: 10000,
  });
  const [sellAmount, setSellAmount] = useState<number>(1);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [selectedSellToken, setSelectedSellToken] = useState<Token>();
  const [selectedPair, setSelectedPair] = useState<Token["contract"]["pairsBaseToken"][0]>();
  const [priceImpact, setPriceImpact] = useState<number>(0);

  const sellablePairs = (pairs.data?.erc20Balances ?? []).filter((pair) =>
    (pair.contract.pairsBaseToken ?? []).some((p) => Number(p.baseReserve) > 0 && Number(p.quoteReserve) > 0),
  );

  useEffect(() => {
    if (selectedSellToken) return;
    if (sellablePairs.length === 0) return;
    setSelectedSellToken(sellablePairs[0]);
  }, [sellablePairs, selectedSellToken]);

  useEffect(() => {
    if (!selectedSellToken) return;
    if (!selectedPair) {
      setSelectedPair(selectedSellToken.contract.pairsBaseToken[0]);
    }
  }, [selectedSellToken, selectedPair]);

  useEffect(() => {
    if (!selectedSellToken || !selectedPair) return;
    setBuyAmount(sellAmount * Number(selectedPair.quoteTokenPrice));
    setFee(sellAmount * (Number(selectedPair.swapFee) / 10000));

    const impact = calculatePriceImpact({
      sellAmount,
      baseReserve: selectedPair.baseReserveExact,
      quoteReserve: selectedPair.quoteReserveExact,
    });
    setPriceImpact(impact);
  }, [selectedSellToken, selectedPair, sellAmount]);

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
                  min={0}
                  step={0.001}
                  value={sellAmount}
                  onChange={(e) => setSellAmount(Number(e.target.value))}
                  className="border-none bg-transparent text-4xl h-12"
                />
                <Select
                  onValueChange={(value) =>
                    setSelectedSellToken(sellablePairs.find((token) => token.contract.symbol === value)!)
                  }
                  value={selectedSellToken?.contract.symbol}
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
              {selectedSellToken && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    Max: {formatTokenValue(Number(selectedSellToken?.value ?? "0"), 2)}{" "}
                    {selectedSellToken.contract.symbol}
                  </div>
                </div>
              )}
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
                  type="text"
                  value={`~${formatTokenValue(buyAmount, 3)}`}
                  className="border-none bg-transparent text-4xl h-12"
                  disabled={true}
                />
                <Select
                  onValueChange={(value) => {
                    const pair = selectedSellToken?.contract.pairsBaseToken.find((p) => p.id === value);
                    setSelectedPair(pair);
                  }}
                  value={selectedPair?.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a token to buy" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSellToken?.contract.pairsBaseToken.map((baseToken) => (
                      <SelectItem key={baseToken.quoteToken.symbol} value={baseToken.id}>
                        {baseToken.quoteToken.name} ({baseToken.quoteToken.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">Swap</Button>

        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Fee ({(Number(selectedSellToken?.contract.pairsBaseToken[0].swapFee ?? "0") / 100).toFixed(2)}%)
              </div>
              <span>
                {formatTokenValue(fee, 2)} {selectedSellToken?.contract.symbol}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Price impact <Info className="h-4 w-4" />
              </div>
              <span className={priceImpact > 5 ? "text-red-500" : ""}>{formatTokenValue(priceImpact, 2)}%</span>
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
