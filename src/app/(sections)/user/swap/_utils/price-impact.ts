interface CalculatePriceImpactParams {
  sellAmount: number;
  baseReserve: string;
  quoteReserve: string;
}

export function calculatePriceImpact({ sellAmount, baseReserve, quoteReserve }: CalculatePriceImpactParams): number {
  if (sellAmount <= 0) return 0;

  // Convert reserves to BigInt to maintain precision
  const baseReserveBI = BigInt(baseReserve);
  const quoteReserveBI = BigInt(quoteReserve);

  // Convert sell amount to same decimal precision as reserves
  const sellAmountBI = BigInt(Math.floor(sellAmount * 1e18));

  // Calculate quote amount out using constant product formula
  const k = baseReserveBI * quoteReserveBI;
  const newBaseReserveBI = baseReserveBI + sellAmountBI;
  const newQuoteReserveBI = k / newBaseReserveBI;
  const quoteAmountBI = quoteReserveBI - newQuoteReserveBI;

  // Calculate prices using floating point for better precision in small numbers
  const spotPrice = Number(quoteReserveBI) / Number(baseReserveBI);
  const executionPrice = Number(quoteAmountBI) / Number(sellAmountBI);

  // Calculate price impact as percentage
  const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;

  // Return price impact with 2 decimal places, minimum 0
  return Math.max(0, Number(priceImpact.toFixed(2)));
}
