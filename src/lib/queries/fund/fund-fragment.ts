export const OffchainFundFragment = hasuraGraphql(`
  fragment OffchainFundFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);
