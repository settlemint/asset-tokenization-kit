'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { type ApproveFormAssetType, ApproveOutputSchema, getApproveFormSchema } from './schema';

const StableCoinApprove = portalGraphql(`
mutation StableCoinApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  Approve: StableCoinApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

const FundApprove = portalGraphql(`
mutation FundApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  Approve: FundApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

const CryptoCurrencyApprove = portalGraphql(`
mutation CryptoCurrencyApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  Approve: CryptoCurrencyApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

const BondApprove = portalGraphql(`
mutation BondApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  Approve: BondApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

const EquityApprove = portalGraphql(`
mutation EquityApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  Approve: EquityApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

export const approveAllowance = actionClient
  .schema(getApproveFormSchema())
  .outputSchema(ApproveOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals, assetType }, ctx: { user } }) => {
    const data = await portalClient.request(getMutation(assetType), {
      address: address,
      from: user.wallet,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.Approve?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to approve the asset');
    }

    return transactionHash;
  });

function getMutation(assetType: ApproveFormAssetType) {
  switch (assetType) {
    case 'stablecoin':
      return StableCoinApprove;
    case 'fund':
      return FundApprove;
    case 'bond':
      return BondApprove;
    case 'equity':
      return EquityApprove;
    case 'cryptocurrency':
      return CryptoCurrencyApprove;
    default: {
      const _exhaustiveCheck: never = assetType as never;
      throw new Error(`Unsupported asset type: ${_exhaustiveCheck}`);
    }
  }
}
