export function getAssetColor(
  type: 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin'
): string {
  switch (type) {
    case 'bond':
      return 'chart-1';
    case 'cryptocurrency':
      return 'chart-2';
    case 'equity':
      return 'chart-3';
    case 'fund':
      return 'chart-4';
    case 'stablecoin':
      return 'chart-5';
    default:
      return 'chart-5';
  }
}
