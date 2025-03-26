export const OffchainCryptoCurrencyFragment = hasuraGraphql(`
  fragment OffchainCryptoCurrencyFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);
