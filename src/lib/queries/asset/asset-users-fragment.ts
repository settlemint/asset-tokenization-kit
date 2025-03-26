export const OffchainAssetFragment = hasuraGraphql(`
  fragment OffchainAssetFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);
