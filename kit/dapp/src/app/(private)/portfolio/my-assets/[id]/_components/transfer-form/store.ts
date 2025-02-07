'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { type TransferFormAssetType, TransferOutputSchema, getTransferFormSchema } from './schema';

const TransferStableCoin = portalGraphql(`
  mutation TransferStableCoin($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: StableCoinTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const TransferFund = portalGraphql(`
  mutation TransferFund($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: FundTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const TransferBond = portalGraphql(`
  mutation TransferBond($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: BondTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const TransferEquity = portalGraphql(`
  mutation TransferEquity($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: EquityTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const TransferCryptoCurrency = portalGraphql(`
  mutation TransferCryptoCurrency($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: CryptoCurrencyTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const transfer = actionClient
  .schema(getTransferFormSchema())
  .outputSchema(TransferOutputSchema)
  .action(async ({ parsedInput: { address, to, value, pincode, assetType, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(getQuery(assetType), {
      address: address,
      from: user.wallet as string,
      to: to,
      value: parseUnits(value.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data?.Transfer?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transfer transaction');
    }

    return transactionHash;
  });

function getQuery(assetType: TransferFormAssetType) {
  if (assetType === 'stablecoin') {
    return TransferStableCoin;
  }
  if (assetType === 'fund') {
    return TransferFund;
  }
  if (assetType === 'bond') {
    return TransferBond;
  }
  if (assetType === 'equity') {
    return TransferEquity;
  }
  if (assetType === 'cryptocurrency') {
    return TransferCryptoCurrency;
  }
  throw new Error(`Unsupported asset type: ${assetType}`);
}
