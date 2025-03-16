import type { Address } from 'viem';
import type { AssetType } from '../../../types';
import { BondsRelated } from './related/bonds';
import { CryptocurrenciesRelated } from './related/cryptocurrencies';
import { EquitiesRelated } from './related/equities';
import { FundsRelated } from './related/funds';
import { StablecoinsRelated } from './related/stablecoins';
import { TokenizedDepositsRelated } from './related/tokenizeddeposits';

interface RelatedProps {
  assettype: AssetType;
  address: Address;
  totalSupply: number;
}

export function Related({ assettype, address, totalSupply }: RelatedProps) {
  switch (assettype) {
    case 'bonds':
      return <BondsRelated address={address} totalSupply={totalSupply} />;
    case 'cryptocurrencies':
      return <CryptocurrenciesRelated address={address} />;
    case 'stablecoins':
      return <StablecoinsRelated address={address} totalSupply={totalSupply} />;
    case 'tokenizeddeposits':
      return (
        <TokenizedDepositsRelated address={address} totalSupply={totalSupply} />
      );
    case 'equities':
      return <EquitiesRelated address={address} totalSupply={totalSupply} />;
    case 'funds':
      return <FundsRelated address={address} totalSupply={totalSupply} />;
    default:
      throw new Error(`Invalid asset type: ${assettype}`);
  }
}
