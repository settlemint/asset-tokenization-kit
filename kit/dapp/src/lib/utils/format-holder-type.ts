import type { AssetBalance } from '@/lib/queries/asset-balance/asset-balance-fragment';

export function formatHolderType<
  T extends (
    key: 'creator-owner' | 'admin' | 'supply-manager' | 'regular'
  ) => unknown,
>(assetBalance: AssetBalance, t: T) {
  if (assetBalance.asset.creator.id === assetBalance.account.id) {
    return t('creator-owner');
  }
  if (
    assetBalance.asset.admins.some(
      (admin) => admin.id === assetBalance.account.id
    )
  ) {
    return t('admin-user');
  }
  if (
    assetBalance.asset.supplyManagers.some(
      (manager) => manager.id === assetBalance.account.id
    )
  ) {
    return t('supply-manager');
  }
  return t('regular');
}
