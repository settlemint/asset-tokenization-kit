import type { Address } from 'viem';
import type { AssetType } from '../../../types';
import { BondsDetails } from './details/bonds';
import { Collateral } from './details/collateral';
import { CryptocurrenciesDetails } from './details/cryptocurrencies';
import { EquitiesDetails } from './details/equities';
import { FundsDetails } from './details/funds';
import { StablecoinsDetails } from './details/stablecoins';
import { TokenizedDepositsDetails } from './details/tokenizeddeposits';

interface DetailsProps {
  assettype: AssetType;
  address: Address;
}

export function Details({ assettype, address }: DetailsProps) {
  switch (assettype) {
    case 'bonds':
      return <BondsDetails address={address} />;
    case 'cryptocurrencies':
      return <CryptocurrenciesDetails address={address} />;
    case 'stablecoins':
      return (
        <>
          <StablecoinsDetails address={address} />
          <Collateral address={address} />
        </>
      );
    case 'tokenizeddeposits':
      return <TokenizedDepositsDetails address={address} />;
    case 'equities':
      return <EquitiesDetails address={address} />;
    case 'funds':
      return <FundsDetails address={address} />;
    default:
      throw new Error(`Invalid asset type: ${assettype}`);
  }
}
