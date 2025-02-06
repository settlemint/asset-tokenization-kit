/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  query AssetsSupply {\n    stableCoins {\n      id\n      totalSupply\n    }\n    bonds {\n      id\n      totalSupply\n    }\n    equities {\n      id\n      totalSupply\n    }\n    cryptoCurrencies {\n      id\n      totalSupply\n    }\n    funds {\n      id\n      totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; totalSupply: string; }[]; bonds: { id: string; totalSupply: string; }[]; equities: { id: string; totalSupply: string; }[]; cryptoCurrencies: { id: string; totalSupply: string; }[]; funds: { id: string; totalSupply: string; }[]; }, {}, void>;
    "\n  fragment SidebarAssetsFragment on Asset {\n    symbol\n    name\n    id\n  }\n":
      TadaDocumentNode<{ __typename?: "StableCoin" | undefined; symbol: string; name: string; id: string; } | { __typename?: "Bond" | undefined; symbol: string; name: string; id: string; } | { __typename?: "Equity" | undefined; symbol: string; name: string; id: string; } | { __typename?: "CryptoCurrency" | undefined; symbol: string; name: string; id: string; } | { __typename?: "Fund" | undefined; symbol: string; name: string; id: string; }, {}, { fragment: "SidebarAssetsFragment"; on: "Asset"; masked: false; }>;
    "\n  query SidebarAssets {\n    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...SidebarAssetsFragment\n    }\n    equities(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...SidebarAssetsFragment\n    }\n    bonds(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...SidebarAssetsFragment\n    }\n    funds(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...SidebarAssetsFragment\n    }\n    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...SidebarAssetsFragment\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { __typename?: "StableCoin" | undefined; symbol: string; name: string; id: string; }[]; equities: { __typename?: "Equity" | undefined; symbol: string; name: string; id: string; }[]; bonds: { __typename?: "Bond" | undefined; symbol: string; name: string; id: string; }[]; funds: { __typename?: "Fund" | undefined; symbol: string; name: string; id: string; }[]; cryptoCurrencies: { __typename?: "CryptoCurrency" | undefined; symbol: string; name: string; id: string; }[]; }, {}, void>;
    "\n  query Bond($id: ID!) {\n    bond(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    underlyingAsset\n    redeemedAmount\n    paused\n    }\n  }\n":
      TadaDocumentNode<{ bond: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; underlyingAsset: string; redeemedAmount: string; paused: boolean; } | null; }, { id: string; }, void>;
    "\n  query Bond($id: ID!) {\n    bond(id: $id) {\n    id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ bond: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment BondBalancesFields on AssetBalance {\n      id\n      value\n  }\n":
      TadaDocumentNode<{ id: string; value: string; }, {}, { fragment: "BondBalancesFields"; on: "AssetBalance"; masked: false; }>;
    "\n  query BondBalances($id: ID!) {\n    bond(id: $id) {\n      asAccount {\n        balances {\n          ...BondBalancesFields\n        }\n      }\n    }\n  }\n":
      TadaDocumentNode<{ bond: { asAccount: { balances: { id: string; value: string; }[]; }; } | null; }, { id: string; }, void>;
    "\n  fragment BondFields on Bond {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    isMatured\n    maturityDate\n    paused\n    faceValue\n    underlyingAsset\n    redeemedAmount\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }, {}, { fragment: "BondFields"; on: "Bond"; masked: false; }>;
    "\n  query Bonds {\n    bonds {\n      ...BondFields\n    }\n  }\n":
      TadaDocumentNode<{ bonds: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }[]; }, {}, void>;
    "\n  query Cryptocurrency($id: ID!) {\n    cryptoCurrency(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query Cryptocurrency($id: ID!) {\n    cryptoCurrency(id: $id) {\n    id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment CryptoCurrencyBalancesFields on AssetBalance {\n      id\n      value\n  }\n":
      TadaDocumentNode<{ id: string; value: string; }, {}, { fragment: "CryptoCurrencyBalancesFields"; on: "AssetBalance"; masked: false; }>;
    "\n  query CryptoCurrencyBalances($id: ID!) {\n    cryptoCurrency(id: $id) {\n      asAccount {\n        balances {\n          ...CryptoCurrencyBalancesFields\n        }\n      }\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { asAccount: { balances: { id: string; value: string; }[]; }; } | null; }, { id: string; }, void>;
    "\n  fragment CryptoCurrencyFields on CryptoCurrency {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; }, {}, { fragment: "CryptoCurrencyFields"; on: "CryptoCurrency"; masked: false; }>;
    "\n  query CryptoCurrencies {\n    cryptoCurrencies {\n      ...CryptoCurrencyFields\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrencies: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; }[]; }, {}, void>;
    "\n  query Equity($id: ID!) {\n    equity(id: $id) {\n     id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ equity: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query Equity($id: ID!) {\n    equity(id: $id) {\n    id\n    name\n    symbol    }\n  }\n":
      TadaDocumentNode<{ equity: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment EquityBalancesFields on AssetBalance {\n      id\n      value\n  }\n":
      TadaDocumentNode<{ id: string; value: string; }, {}, { fragment: "EquityBalancesFields"; on: "AssetBalance"; masked: false; }>;
    "\n  query EquityBalances($id: ID!) {\n    equity(id: $id) {\n      asAccount {\n        balances {\n          ...EquityBalancesFields\n        }\n      }\n    }\n  }\n":
      TadaDocumentNode<{ equity: { asAccount: { balances: { id: string; value: string; }[]; }; } | null; }, { id: string; }, void>;
    "\n  query AddressBalances($account: String!) {\n    assetBalances(where: {account: $account}) {\n      value\n      asset {\n        name\n        symbol\n      }\n    }\n  }\n":
      TadaDocumentNode<{ assetBalances: { value: string; asset: { __typename?: "StableCoin" | undefined; name: string; symbol: string; } | { __typename?: "Bond" | undefined; name: string; symbol: string; } | { __typename?: "Equity" | undefined; name: string; symbol: string; } | { __typename?: "CryptoCurrency" | undefined; name: string; symbol: string; } | { __typename?: "Fund" | undefined; name: string; symbol: string; }; }[]; }, { account: string; }, void>;
    "\n  fragment EquityFields on Equity {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    equityCategory\n    equityClass\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }, {}, { fragment: "EquityFields"; on: "Equity"; masked: false; }>;
    "\n  query Equities {\n    equities {\n      ...EquityFields\n    }\n  }\n":
      TadaDocumentNode<{ equities: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }[]; }, {}, void>;
    "\n  query Fund($id: ID!) {\n    fund(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    fundCategory\n    fundClass\n    paused\n    }\n  }\n":
      TadaDocumentNode<{ fund: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; } | null; }, { id: string; }, void>;
    "\n  query Fund($id: ID!) {\n    fund(id: $id) {\n     id\n    name\n    symbol\n    }\n  }\n":
      TadaDocumentNode<{ fund: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment FundBalancesFields on AssetBalance {\n      id\n      value\n  }\n":
      TadaDocumentNode<{ id: string; value: string; }, {}, { fragment: "FundBalancesFields"; on: "AssetBalance"; masked: false; }>;
    "\n  query FundBalances($id: ID!) {\n    fund(id: $id) {\n      asAccount {\n        balances {\n          ...FundBalancesFields\n        }\n      }\n    }\n  }\n":
      TadaDocumentNode<{ fund: { asAccount: { balances: { id: string; value: string; }[]; }; } | null; }, { id: string; }, void>;
    "\n  fragment FundFields on Fund {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    fundCategory\n    fundClass\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; }, {}, { fragment: "FundFields"; on: "Fund"; masked: false; }>;
    "\n  query Funds {\n    funds {\n      ...FundFields\n    }\n  }\n":
      TadaDocumentNode<{ funds: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; fundCategory: string; fundClass: string; paused: boolean; }[]; }, {}, void>;
    "\n  query StableCoin($id: ID!) {\n    stableCoin(id: $id) {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query StableCoin($id: ID!) {\n    stableCoin(id: $id) {\n    id\n    name\n    symbol    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { id: string; name: string; symbol: string; } | null; }, { id: string; }, void>;
    "\n  fragment StablecoinBalancesFields on AssetBalance {\n      id\n      value\n  }\n":
      TadaDocumentNode<{ id: string; value: string; }, {}, { fragment: "StablecoinBalancesFields"; on: "AssetBalance"; masked: false; }>;
    "\n    query StablecoinBalances($id: ID!) {\n    stableCoin(id: $id) {\n      asAccount {\n        balances {\n          ...StablecoinBalancesFields\n        }\n      }\n    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { asAccount: { balances: { id: string; value: string; }[]; }; } | null; }, { id: string; }, void>;
    "\n  fragment StableCoinFields on StableCoin {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    collateral\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string; symbol: string; decimals: number; totalSupply: string; collateral: string; paused: boolean; }, {}, { fragment: "StableCoinFields"; on: "StableCoin"; masked: false; }>;
    "\n  query StableCoins {\n    stableCoins {\n      ...StableCoinFields\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; name: string; symbol: string; decimals: number; totalSupply: string; collateral: string; paused: boolean; }[]; }, {}, void>;
    "\n  query SearchAssets {\n    assets {\n      id\n      name\n      symbol\n    }\n  }\n":
      TadaDocumentNode<{ assets: ({ __typename?: "StableCoin" | undefined; id: string; name: string; symbol: string; } | { __typename?: "Bond" | undefined; id: string; name: string; symbol: string; } | { __typename?: "Equity" | undefined; id: string; name: string; symbol: string; } | { __typename?: "CryptoCurrency" | undefined; id: string; name: string; symbol: string; } | { __typename?: "Fund" | undefined; id: string; name: string; symbol: string; })[]; }, {}, void>;
    "\n  query OgBond($id: ID!) {\n    bond(id: $id) {\n      name\n      symbol\n      totalSupply\n      maturityDate\n      faceValue\n    }\n  }\n":
      TadaDocumentNode<{ bond: { name: string; symbol: string; totalSupply: string; maturityDate: string; faceValue: string; } | null; }, { id: string; }, void>;
    "\n  query OgCryptoCurrency($id: ID!) {\n    cryptoCurrency(id: $id) {\n      name\n      symbol\n      totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrency: { name: string; symbol: string; totalSupply: string; } | null; }, { id: string; }, void>;
    "\n  query OgEquity($id: ID!) {\n    equity(id: $id) {\n      name\n      symbol\n      totalSupply\n      equityCategory\n      equityClass\n    }\n  }\n":
      TadaDocumentNode<{ equity: { name: string; symbol: string; totalSupply: string; equityCategory: string; equityClass: string; } | null; }, { id: string; }, void>;
    "\n  query OgFund($id: ID!) {\n    fund(id: $id) {\n      name\n      symbol\n      totalSupply\n      fundClass\n      fundCategory\n    }\n  }\n":
      TadaDocumentNode<{ fund: { name: string; symbol: string; totalSupply: string; fundClass: string; fundCategory: string; } | null; }, { id: string; }, void>;
    "\n  query OgStablecoin($id: ID!) {\n    stableCoin(id: $id) {\n      name\n      symbol\n      totalSupply\n      collateral\n    }\n  }\n":
      TadaDocumentNode<{ stableCoin: { name: string; symbol: string; totalSupply: string; collateral: string; } | null; }, { id: string; }, void>;
  }
}
