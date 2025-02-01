export const TokenType = {
  Stablecoin: 'stablecoin',
  Equity: 'equity',
  Bond: 'bond',
  Cryptocurrency: 'cryptocurrency',
  Fund: 'fund',
} as const;

export type TokenTypeKey = keyof typeof TokenType;

export type TokenTypeValue = (typeof TokenType)[TokenTypeKey];
