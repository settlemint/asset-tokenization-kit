export function AssetsWidget() {
  // const t = useTranslations('admin.dashboard.widgets');
  // const { data } = useAssetActivity();
  // const allAssetsSupply = data.reduce(
  //   (acc, asset) => acc + asset.totalSupply,
  //   0n
  // );

  // const getAssetSupply = (assetType: (typeof data)[number]['assetType']) => {
  //   return (
  //     data.find((asset) => asset.assetType === assetType)?.totalSupply || 0
  //   );
  // };

  return (
    // <Widget
    //   label={t('assets.label')}
    //   value={formatNumber(allAssetsSupply)}
    //   subtext={t('assets.subtext', {
    //     stableCoins: formatNumber(getAssetSupply('stablecoin')),
    //     bonds: formatNumber(getAssetSupply('bond')),
    //     cryptocurrencies: formatNumber(getAssetSupply('cryptocurrency')),
    //     equities: formatNumber(getAssetSupply('equity')),
    //     funds: formatNumber(getAssetSupply('fund')),
    //   })}
    // />
    <div>Assets</div>
  );
}
