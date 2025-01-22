/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  fragment TokenFragment on Asset {\n    symbol\n    name\n    id\n  }\n":
      TadaDocumentNode<{ __typename?: "Bond" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "CryptoCurrency" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "Equity" | undefined; symbol: string | null; name: string | null; id: string; } | { __typename?: "StableCoin" | undefined; symbol: string | null; name: string | null; id: string; }, {}, { fragment: "TokenFragment"; on: "Asset"; masked: false; }>;
    "\n  query NavigationQuery {\n    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    equities(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    bonds(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {\n      ...TokenFragment\n    }\n  }\n":
      TadaDocumentNode<{ stableCoins: { __typename?: "StableCoin" | undefined; symbol: string | null; name: string | null; id: string; }[]; equities: { __typename?: "Equity" | undefined; symbol: string | null; name: string | null; id: string; }[]; bonds: { __typename?: "Bond" | undefined; symbol: string | null; name: string | null; id: string; }[]; cryptoCurrencies: { __typename?: "CryptoCurrency" | undefined; symbol: string | null; name: string | null; id: string; }[]; }, {}, void>;
    "\n  query SearchAssets {\n    assets {\n      id\n      name\n      symbol\n    }\n  }\n":
      TadaDocumentNode<{ assets: ({ __typename?: "Bond" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "CryptoCurrency" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "Equity" | undefined; id: string; name: string | null; symbol: string | null; } | { __typename?: "StableCoin" | undefined; id: string; name: string | null; symbol: string | null; })[]; }, {}, void>;
    "\n  query AddressBalances($account: String!) {\n    balances(where: {account: $account}) {\n      value\n      asset {\n        name\n        symbol\n      }\n    }\n  }\n":
      TadaDocumentNode<{ balances: { value: string; asset: { __typename?: "Bond" | undefined; name: string | null; symbol: string | null; } | { __typename?: "CryptoCurrency" | undefined; name: string | null; symbol: string | null; } | { __typename?: "Equity" | undefined; name: string | null; symbol: string | null; } | { __typename?: "StableCoin" | undefined; name: string | null; symbol: string | null; }; }[]; }, { account: string; }, void>;
  }
}
