import type { QueryKey } from '@tanstack/react-query';
import {
  BOND_FACTORY_ADDRESS,
  CRYPTO_CURRENCY_FACTORY_ADDRESS,
  EQUITY_FACTORY_ADDRESS,
  FUND_FACTORY_ADDRESS,
  STABLE_COIN_FACTORY_ADDRESS,
} from '../contracts';

export interface AssetDetailConfig {
  name: string;
  pluralName: string;
  description: string;
  factoryAddress: string;
  queryKey: QueryKey;
  urlSegment: string;
}

/**
 * Interface defining the site's theme configuration
 */
interface AssetConfig {
  bond: AssetDetailConfig;
  cryptocurrency: AssetDetailConfig;
  equity: AssetDetailConfig;
  fund: AssetDetailConfig;
  stablecoin: AssetDetailConfig;
}

export const assetConfig = {
  bond: {
    name: 'Bond',
    pluralName: 'Bonds',
    description: 'Digital assets representing a debt obligation',
    factoryAddress: BOND_FACTORY_ADDRESS,
    queryKey: ['bonds'],
    urlSegment: 'bonds',
  },
  cryptocurrency: {
    name: 'Cryptocurrency',
    pluralName: 'Cryptocurrencies',
    description: 'Digital assets representing a fully decentralized currency',
    factoryAddress: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    queryKey: ['cryptocurrencies'],
    urlSegment: 'cryptocurrencies',
  },
  equity: {
    name: 'Equity',
    pluralName: 'Equities',
    description: 'Digital assets representing ownership in a company',
    factoryAddress: EQUITY_FACTORY_ADDRESS,
    queryKey: ['equities'],
    urlSegment: 'equities',
  },
  fund: {
    name: 'Fund',
    pluralName: 'Funds',
    description: 'Digital assets representing a fund',
    factoryAddress: FUND_FACTORY_ADDRESS,
    queryKey: ['funds'],
    urlSegment: 'funds',
  },
  stablecoin: {
    name: 'Stablecoin',
    pluralName: 'Stablecoins',
    description: 'Digital assets pegged to a stable asset like USD',
    factoryAddress: STABLE_COIN_FACTORY_ADDRESS,
    queryKey: ['stablecoins'],
    urlSegment: 'stablecoins',
  },
} as const satisfies AssetConfig;

export const assetsQueryKey: QueryKey = [
  'Assets',
  assetConfig.bond.queryKey,
  assetConfig.cryptocurrency.queryKey,
  assetConfig.equity.queryKey,
  assetConfig.fund.queryKey,
  assetConfig.stablecoin.queryKey,
];
