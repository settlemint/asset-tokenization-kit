"use client";

import { approveTokenAction } from "@/app/(sections)/issuer/pairs/[address]/details/_forms/approve-token-action";
import { executeSwapAction } from "@/app/(sections)/user/swap/_actions/execute-swap";
import { TokenSelect } from "@/app/(sections)/user/swap/_components/token-select";
import {
  SwapBaseToQuoteTokenReceiptQuery,
  SwapQuoteToBaseTokenReceiptQuery,
} from "@/app/(sections)/user/swap/_graphql/queries";
import { useSwapTokens } from "@/app/(sections)/user/swap/_hooks/use-swap-tokens";
import { Input } from "@/components/blocks/form/form-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTokenValue } from "@/lib/number";
import { portalClient } from "@/lib/settlemint/portal";
import { waitForTransactionReceipt } from "@/lib/transactions";
import { ArrowDown, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { parseUnits } from "viem";
import { calculatePriceImpact } from "../_utils/price-impact";
import { calculateDynamicSlippage } from "../_utils/slippage";

export function Swap({ address }: { address: Address }) {
  const { validInputTokens, getOutputTokensForInput, findPairByTokens } = useSwapTokens(address);

  const [sellAmount, setSellAmount] = useState<number>(0);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [inputToken, setInputToken] = useState<string>();
  const [outputToken, setOutputToken] = useState<string>();
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = async () => {
    if (!currentPair || !inputToken || !outputToken || sellAmount <= 0) return;
    setIsSwapping(true);

    try {
      // First approve the token
      toast.promise(
        (async () => {
          const transactionHash = await approveTokenAction({
            tokenAddress: currentPair.isBaseToQuote ? currentPair.token0.address : currentPair.token1.address,
            spender: currentPair.pairId,
            approveAmount: sellAmount,
          });

          await waitForTransactionReceipt({
            receiptFetcher: async () => {
              const txresult = await portalClient.request(
                currentPair.isBaseToQuote ? SwapBaseToQuoteTokenReceiptQuery : SwapQuoteToBaseTokenReceiptQuery,
                { transactionHash: transactionHash?.data ?? "" },
              );
              return txresult.StarterKitERC20DexSwapBaseToQuoteReceipt;
            },
          });
        })(),
        {
          loading: "Approving token...",
          success: async () => {
            // Execute the swap after successful approval
            const expectedAmount = buyAmount;
            const slippagePercent = calculateDynamicSlippage(BigInt(currentPair?.reserve0Exact ?? 0));
            const minAmount = Math.floor(expectedAmount * (1 - slippagePercent / 100));
            const deadline = Math.floor(Date.now() / 1000) + 1200;

            const sellAmountWei = parseUnits(sellAmount.toString(), 18).toString();
            const minAmountWei = parseUnits(minAmount.toString(), 18).toString();

            toast.promise(
              (async () => {
                const transactionHash = await executeSwapAction({
                  pairAddress: currentPair.pairId,
                  baseTokenAddress: currentPair.token0.address,
                  quoteTokenAddress: currentPair.token1.address,
                  from: address,
                  amount: sellAmountWei,
                  minAmount: minAmountWei,
                  isBaseToQuote: currentPair.isBaseToQuote,
                  deadline: deadline.toString(),
                });

                await waitForTransactionReceipt({
                  receiptFetcher: async () => {
                    const txresult = await portalClient.request(
                      currentPair.isBaseToQuote ? SwapBaseToQuoteTokenReceiptQuery : SwapQuoteToBaseTokenReceiptQuery,
                      { transactionHash: transactionHash?.data ?? "" },
                    );
                    return txresult.StarterKitERC20DexSwapBaseToQuoteReceipt;
                  },
                });

                setSellAmount(0);
                setBuyAmount(0);
                setIsSwapping(false);
              })(),
              {
                loading: "Swapping tokens...",
                success: `${sellAmount}/${buyAmount} tokens swapped`,
                error: (error) => `Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            );

            return "Token approved successfully";
          },
          error: (error) => `Approval failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      );
    } catch (error) {
      console.error(error);
      setIsSwapping(false);
    }
  };

  /**
   * Swaps the input and output tokens if both are selected
   */
  const handleSwapTokens = () => {
    if (!inputToken || !outputToken) return;

    const newInputToken = outputToken;
    const newOutputToken = inputToken;

    setInputToken(newInputToken);
    setOutputToken(newOutputToken);

    // Reset the amounts since the pair will be different
    setSellAmount(0);
    setBuyAmount(0);
  };

  // Get available output tokens based on selected input token
  const availableOutputTokens = useMemo(() => {
    if (!inputToken) return [];
    return getOutputTokensForInput(inputToken);
  }, [inputToken, getOutputTokensForInput]);

  // Reset output token when input token changes and auto-select if only one option
  useEffect(() => {
    if (!inputToken) {
      setOutputToken(undefined);
      return;
    }

    const outputTokens = getOutputTokensForInput(inputToken);
    if (outputTokens.length === 1) {
      // Auto-select the only available output token
      setOutputToken(outputTokens[0].symbol);
    } else {
      // Reset selection if multiple options or no options
      setOutputToken(undefined);
    }
  }, [inputToken, getOutputTokensForInput]);

  // Get current pair information
  const currentPair = useMemo(() => {
    if (!inputToken || !outputToken) return undefined;
    return findPairByTokens(inputToken, outputToken);
  }, [inputToken, outputToken, findPairByTokens]);

  // Update amounts and fees when pair or amount changes
  useEffect(() => {
    if (!currentPair || sellAmount <= 0) {
      setBuyAmount(0);
      setFee(0);
      setPriceImpact(0);
      return;
    }

    setBuyAmount(sellAmount * Number(currentPair.price));
    setFee(sellAmount * (Number(currentPair.swapFee) / 10000));

    const impact = calculatePriceImpact({
      sellAmount,
      baseReserve: currentPair.reserve0Exact,
      quoteReserve: currentPair.reserve1Exact,
    });
    setPriceImpact(impact);
  }, [currentPair, sellAmount]); // Explicit dependency on sellAmount

  const getMaxSellAmount = (token?: string): number => {
    if (!token || !currentPair) return 0;
    const tokenInfo = currentPair.token0.symbol === token ? currentPair.token0 : currentPair.token1;
    return tokenInfo.balance ? Number(tokenInfo.balance) : 0;
  };

  if (!validInputTokens.length) {
    return <div>No trading pairs with liquidity available for you</div>;
  }

  return (
    <div className="p-4">
      <div className="mx-auto max-w-md space-y-4">
        <Card className="border-none">
          <CardContent className="space-y-4 p-4">
            {/* Input token section */}
            <div className="space-y-2">
              <div className="text-lg">Sell</div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    min={0}
                    step={0.001}
                    value={sellAmount}
                    onChange={(e) => setSellAmount(Number(e.target.value))}
                    className="border-none bg-transparent text-4xl h-12"
                  />
                  {inputToken && (
                    <button
                      onClick={() => setSellAmount(getMaxSellAmount(inputToken))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                      type="button"
                    >
                      Max: {formatTokenValue(getMaxSellAmount(inputToken), 2)}
                    </button>
                  )}
                </div>
                <TokenSelect
                  tokens={validInputTokens}
                  selectedToken={inputToken}
                  onSelectAction={setInputToken}
                  placeholder="Select token to sell"
                />
              </div>
            </div>

            {/* Arrow separator */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapTokens}
                className="rounded-full bg-neutral-800 p-4 transition-colors hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputToken || !outputToken}
                aria-label="Swap tokens"
              >
                <ArrowDown className="h-6 w-6" />
              </button>
            </div>

            {/* Output token section */}
            <div className="space-y-2">
              <div className="text-lg">Buy</div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={inputToken && outputToken ? `${formatTokenValue(buyAmount, 3)}` : ""}
                  className="border-none bg-transparent text-4xl h-12"
                  disabled={true}
                />
                <TokenSelect
                  tokens={availableOutputTokens}
                  selectedToken={outputToken}
                  onSelectAction={setOutputToken}
                  placeholder="Select token to buy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          disabled={!inputToken || !outputToken || sellAmount <= 0 || isSwapping}
          onClick={handleSwap}
        >
          {isSwapping ? "Swapping..." : "Swap"}
        </Button>

        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                Fee ({(Number(currentPair?.swapFee ?? "0") / 100).toFixed(2)}%)
              </div>
              <span>
                {formatTokenValue(fee, 2)} {inputToken}
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
                <span>{calculateDynamicSlippage(BigInt(currentPair?.reserve0Exact ?? 0))}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
