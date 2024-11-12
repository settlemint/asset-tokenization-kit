import { portalGraphql } from "@/lib/settlemint/portal";

export const SwapBaseToQuote = portalGraphql(`
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

export const SwapQuoteToBase = portalGraphql(`
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
