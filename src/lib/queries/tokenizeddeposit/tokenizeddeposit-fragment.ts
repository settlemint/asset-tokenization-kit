export const OffchainTokenizedDepositFragment = hasuraGraphql(`
  fragment OffchainTokenizedDepositFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);
