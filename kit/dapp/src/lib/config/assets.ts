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
  color: string;
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
    color: '#8b5cf6',
  },
  cryptocurrency: {
    name: 'Cryptocurrency',
    pluralName: 'Cryptocurrencies',
    description: 'Digital assets representing a fully decentralized currency',
    factoryAddress: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    queryKey: ['cryptocurrencies'],
    urlSegment: 'cryptocurrencies',
    color: '#2563eb',
  },
  equity: {
    name: 'Equity',
    pluralName: 'Equities',
    description: 'Digital assets representing ownership in a company',
    factoryAddress: EQUITY_FACTORY_ADDRESS,
    queryKey: ['equities'],
    urlSegment: 'equities',
    color: '#4ade80',
  },
  fund: {
    name: 'Fund',
    pluralName: 'Funds',
    description: 'Digital assets representing a fund',
    factoryAddress: FUND_FACTORY_ADDRESS,
    queryKey: ['funds'],
    urlSegment: 'funds',
    color: '#10b981',
  },
  stablecoin: {
    name: 'Stablecoin',
    pluralName: 'Stablecoins',
    description: 'Digital assets pegged to a stable asset like USD',
    factoryAddress: STABLE_COIN_FACTORY_ADDRESS,
    queryKey: ['stablecoins'],
    urlSegment: 'stablecoins',
    color: '#0ea5e9',
  },
} as const satisfies AssetConfig;

export const pluralize = (count: number, name: string, pluralName: string): string => (count === 1 ? name : pluralName);
