export const TokenType = {
  Stablecoin: 'stablecoin',
  Equity: 'equity',
  Bond: 'bond',
  Cryptocurrency: 'cryptocurrency',
  Fund: 'fund',
} as const;

export type TokenTypeKey = keyof typeof TokenType;

export type TokenTypeValue = (typeof TokenType)[TokenTypeKey];

export const TokenTypeRoutes = {
  [TokenType.Stablecoin]: 'stablecoins',
  [TokenType.Equity]: 'equities',
  [TokenType.Bond]: 'bonds',
  [TokenType.Cryptocurrency]: 'cryptocurrencies',
  [TokenType.Fund]: 'funds',
} as const;

export type TokenTypeRouteKey = keyof typeof TokenTypeRoutes;

export type TokenTypeRouteValue = (typeof TokenTypeRoutes)[TokenTypeRouteKey];
