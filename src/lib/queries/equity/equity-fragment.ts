export const OffchainEquityFragment = hasuraGraphql(`
  fragment OffchainEquityFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);
