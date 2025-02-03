/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  query AssetsSupply {\n    stableCoins {\n      id\n      totalSupply\n    }\n    bonds {\n      id\n      totalSupply\n    }\n    equities {\n      id\n      totalSupply\n    }\n    cryptoCurrencies {\n      id\n      totalSupply\n    }\n    funds {\n      id\n      totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; totalSupply: string; }[]; bonds: { id: string; totalSupply: string; }[]; equities: { id: string; totalSupply: string; }[]; cryptoCurrencies: { id: string; totalSupply: string; }[]; funds: { id: string; totalSupply: string; }[]; }, {}, void>;
    "\n  query Bond($id: ID!) {\n    bond(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    underlyingAsset\n    redeemedAmount\n    paused\n    }\n  }\n":
      TadaDocumentNode<{ bond: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; underlyingAsset: string; redeemedAmount: string; paused: boolean; } | null; }, { id: string; }, void>;
    "\n  query Bond($id: ID!) {\n    bond(id: $id) {\n    id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ bond: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment BondBalancesFields on Bond {\n    balances {\n      id\n      value\n    }\n  }\n":
      TadaDocumentNode<{ balances: { id: string; value: string; }[]; }, {}, { fragment: "BondBalancesFields"; on: "Bond"; masked: false; }>;
    "\n  query BondBalances($id: ID!) {\n    bond(id: $id) {\n      ...BondBalancesFields\n    }\n  }\n":
      TadaDocumentNode<{ bond: { balances: { id: string; value: string; }[]; } | null; }, { id: string; }, void>;
    "\n  fragment BondFields on Bond {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    isMatured\n    maturityDate\n    paused\n    faceValue\n    underlyingAsset\n    redeemedAmount\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }, {}, { fragment: "BondFields"; on: "Bond"; masked: false; }>;
    "\n  query Bonds {\n    bonds {\n      ...BondFields\n    }\n  }\n":
      TadaDocumentNode<{ bonds: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }[]; }, {}, void>;
    "\n  query Cryptocurrency($id: ID!) {\n    cryptoCurrency(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query Cryptocurrency($id: ID!) {\n    cryptoCurrency(id: $id) {\n    id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment CryptocurrencyBalancesFields on CryptoCurrency {\n    balances {\n      id\n      value\n    }\n  }\n":
      TadaDocumentNode<{ balances: { id: string; value: string; }[]; }, {}, { fragment: "CryptocurrencyBalancesFields"; on: "CryptoCurrency"; masked: false; }>;
    "\n  query CryptocurrencyBalances($id: ID!) {\n    cryptoCurrency(id: $id) {\n      ...CryptocurrencyBalancesFields\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { balances: { id: string; value: string; }[]; } | null; }, { id: string; }, void>;
    "\n  fragment CryptoCurrencyFields on CryptoCurrency {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; }, {}, { fragment: "CryptoCurrencyFields"; on: "CryptoCurrency"; masked: false; }>;
    "\n  query CryptoCurrencies {\n    cryptoCurrencies {\n      ...CryptoCurrencyFields\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrencies: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; }[]; }, {}, void>;
    "\n  query Equity($id: ID!) {\n    equity(id: $id) {\n     id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ equity: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query Equity($id: ID!) {\n    equity(id: $id) {\n    id\n    name\n    symbol    }\n  }\n":
      TadaDocumentNode<{ equity: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment EquityBalancesFields on Equity {\n    balances {\n      id\n      value\n    }\n  }\n":
      TadaDocumentNode<{ balances: { id: string; value: string; }[]; }, {}, { fragment: "EquityBalancesFields"; on: "Equity"; masked: false; }>;
    "\n  query EquityBalances($id: ID!) {\n    equity(id: $id) {\n      ...EquityBalancesFields\n    }\n  }\n":
      TadaDocumentNode<{ equity: { balances: { id: string; value: string; }[]; } | null; }, { id: string; }, void>;
    "\n  query AddressBalances($account: String!) {\n    balances(where: {account: $account}) {\n      value\n      asset {\n        name\n        symbol\n      }\n    }\n  }\n":
      TadaDocumentNode<{ balances: { value: string; asset: { __typename?: "Bond" | undefined; name: string; symbol: string; } | { __typename?: "CryptoCurrency" | undefined; name: string; symbol: string; } | { __typename?: "Equity" | undefined; name: string; symbol: string; } | { __typename?: "Fund" | undefined; name: string; symbol: string; } | { __typename?: "StableCoin" | undefined; name: string; symbol: string; }; }[]; }, { account: string; }, void>;
    "\n  fragment EquityFields on Equity {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    equityCategory\n    equityClass\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }, {}, { fragment: "EquityFields"; on: "Equity"; masked: false; }>;
    "\n  query Equities {\n    equities {\n      ...EquityFields\n    }\n  }\n":
      TadaDocumentNode<{ equities: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }[]; }, {}, void>;
    "\n  query Fund($id: ID!) {\n    fund(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    fundCategory\n    fundClass\n    paused\n    }\n  }\n":
      TadaDocumentNode<{ fund: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; } | null; }, { id: string; }, void>;
    "\n  query Fund($id: ID!) {\n    fund(id: $id) {\n     id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ fund: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment FundBalancesFields on Fund {\n    balances {\n      id\n      value\n    }\n  }\n":
      TadaDocumentNode<{ balances: { id: string; value: string; }[]; }, {}, { fragment: "FundBalancesFields"; on: "Fund"; masked: false; }>;
    "\n  query FundBalances($id: ID!) {\n    fund(id: $id) {\n      ...FundBalancesFields\n    }\n  }\n":
      TadaDocumentNode<{ fund: { balances: { id: string; value: string; }[]; } | null; }, { id: string; }, void>;
    "\n  fragment FundFields on Fund {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    fundCategory\n    fundClass\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; }, {}, { fragment: "FundFields"; on: "Fund"; masked: false; }>;
    "\n  query Funds {\n    funds {\n      ...FundFields\n    }\n  }\n":
      TadaDocumentNode<{ funds: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; }[]; }, {}, void>;
    "\n  query StableCoin($id: ID!) {\n    stableCoin(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query StableCoin($id: ID!) {\n    stableCoin(id: $id) {\n    id\n    name\n    symbol    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment StableCoinBalancesFields on StableCoin {\n    balances {\n      id\n      value\n    }\n  }\n":
      TadaDocumentNode<{ balances: { id: string; value: string; }[]; }, {}, { fragment: "StableCoinBalancesFields"; on: "StableCoin"; masked: false; }>;
    "\n  query StableCoinBalances($id: ID!) {\n    stableCoin(id: $id) {\n      ...StableCoinBalancesFields\n    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { balances: { id: string; value: string; }[]; } | null; }, { id: string; }, void>;
    "\n  fragment StableCoinFields on StableCoin {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    collateral\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; collateral: string; paused: boolean; }, {}, { fragment: "StableCoinFields"; on: "StableCoin"; masked: false; }>;
    "\n  query StableCoins {\n    stableCoins {\n      ...StableCoinFields\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; collateral: string; paused: boolean; }[]; }, {}, void>;
    "\n  query SearchAssets {\n    assets {\n      id\n      name\n      symbol\n    }\n  }\n":
      TadaDocumentNode<{ assets: ({ __typename?: "Bond" | undefined; id: string; name: string; symbol: string; } | { __typename?: "CryptoCurrency" | undefined; id: string; name: string; symbol: string; } | { __typename?: "Equity" | undefined; id: string; name: string; symbol: string; } | { __typename?: "Fund" | undefined; id: string; name: string; symbol: string; } | { __typename?: "StableCoin" | undefined; id: string; name: string; symbol: string; })[]; }, {}, void>;
  }
}
