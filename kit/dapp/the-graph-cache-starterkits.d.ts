/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  query AssetsSupply {\n    stableCoins {\n      id\n      totalSupply\n    }\n    bonds {\n      id\n      totalSupply\n    }\n    equities {\n      id\n      totalSupply\n    }\n    cryptoCurrencies {\n      id\n      totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; totalSupply: string; }[]; bonds: { id: string; totalSupply: string; }[]; equities: { id: string; totalSupply: string; }[]; cryptoCurrencies: { id: string; totalSupply: string; }[]; }, {}, void>;
    "\n  fragment TokenFragment on Asset {\n    symbol\n    name\n    id\n  }\n":
      TadaDocumentNode<{ __typename?: "StableCoin" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "Bond" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "Equity" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "CryptoCurrency" | undefined; symbol: string | null; name: string | null; id: string; }, {}, { fragment: "TokenFragment"; on: "Asset"; masked: false; }>;
    "\n  query NavigationQuery {\n    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    equities(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    bonds(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { __typename?: "StableCoin" | undefined; symbol: string | null; name: string | null; id: string; }[]; equities: { __typename?: "Equity" | undefined; symbol: string | null; name: string | null; id: string; }[]; bonds: { __typename?: "Bond" | undefined; symbol: string | null; name: string | null; id: string; }[]; cryptoCurrencies: { __typename?: "CryptoCurrency" | undefined; symbol: string | null; name: string | null; id: string; }[]; }, {}, void>;
    "\n  fragment BondFields on Bond {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    isMatured\n    maturityDate\n    paused\n    faceValue\n    underlyingAsset\n    redeemedAmount\n  }\n":
      TadaDocumentNode<{ id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }, {}, { fragment: "BondFields"; on: "Bond"; masked: false; }>;
    "\n  query Bonds {\n    bonds {\n      ...BondFields\n    }\n  }\n":
      TadaDocumentNode<{ bonds: { id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; isMatured: boolean; maturityDate: string; paused: boolean; faceValue: string; underlyingAsset: string; redeemedAmount: string; }[]; }, {}, void>;
    "\n  fragment CryptoCurrencyFields on CryptoCurrency {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n  }\n":
      TadaDocumentNode<{ id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; }, {}, { fragment: "CryptoCurrencyFields"; on: "CryptoCurrency"; masked: false; }>;
    "\n  query CryptoCurrencies {\n    cryptoCurrencies {\n      ...CryptoCurrencyFields\n    }\n  }\n":
      TadaDocumentNode<{ cryptoCurrencies: { id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; }[]; }, {}, void>;
    "\n  query AddressBalances($account: String!) {\n    balances(where: {account: $account}) {\n      value\n      asset {\n        name\n        symbol\n      }\n    }\n  }\n":
      TadaDocumentNode<{ balances: { value: string; asset: { __typename?: "StableCoin" | undefined; name: string | null; symbol: string | null; } | { __typename?: "Bond" | undefined; name: string | null; symbol: string | null; } | { __typename?: "Equity" | undefined; name: string | null; symbol: string | null; } | { __typename?: "CryptoCurrency" | undefined; name: string | null; symbol: string | null; }; }[]; }, { account: string; }, void>;
    "\n  fragment EquityFields on Equity {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    equityCategory\n    equityClass\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }, {}, { fragment: "EquityFields"; on: "Equity"; masked: false; }>;
    "\n  query Equities {\n    equities {\n      ...EquityFields\n    }\n  }\n":
      TadaDocumentNode<{ equities: { id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; equityCategory: string; equityClass: string; paused: boolean; }[]; }, {}, void>;
    "\n  fragment StableCoinFields on StableCoin {\n    id\n    name\n    symbol\n    decimals\n    totalSupply\n    collateral\n    paused\n  }\n":
      TadaDocumentNode<{ id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; collateral: string; paused: boolean; }, {}, { fragment: "StableCoinFields"; on: "StableCoin"; masked: false; }>;
    "\n  query StableCoins {\n    stableCoins {\n      ...StableCoinFields\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; collateral: string; paused: boolean; }[]; }, {}, void>;
    "\n  query StableCoin($id: Bytes!) {\n  stableCoins(\n    where: {id: $id }\n  ) {\n    ...StableCoinFields\n  }\n  }\n":
      TadaDocumentNode<{ stableCoins: { id: string; name: string | null; symbol: string | null; decimals: number; totalSupply: string; collateral: string; paused: boolean; }[]; }, { id: string; }, void>;
    "\n  query SearchAssets {\n    assets {\n      id\n      name\n      symbol\n    }\n  }\n":
      TadaDocumentNode<{ assets: ({ __typename?: "StableCoin" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "Bond" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "Equity" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "CryptoCurrency" | undefined; id: string; name: string | null; symbol: string | null; })[]; }, {}, void>;
  }
}
