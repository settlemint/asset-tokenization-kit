export function formatAssetType(type: string) {
  switch (type) {
    case 'bond':
      return 'Bond';
    case 'stablecoin':
      return 'Stable coin';
    case 'equity':
      return 'Equity';
    case 'cryptocurrency':
      return 'Crypto currency';
    case 'fund':
      return 'Fund';
    default:
      return 'Unknown';
  }
}
