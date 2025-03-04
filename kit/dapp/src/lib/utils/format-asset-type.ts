export function formatAssetType(type: string) {
  switch (type) {
    case 'bond':
      return 'Bond';
    case 'stablecoin':
      return 'Stablecoin';
    case 'equity':
      return 'Equity';
    case 'cryptocurrency':
      return 'Cryptocurrency';
    case 'fund':
      return 'Fund';
    default:
      return 'Unknown';
  }
}
