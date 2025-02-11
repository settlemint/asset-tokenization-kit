import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const AssetsEventsQuery = theGraphGraphqlStarterkits(`
  query AssetActivityData {
    assetActivityDatas {
      id
      assetType
      burnEventCount
      mintEventCount
      transferEventCount
    }
  }
`);

export async function getAssetsEventsData() {
  const data = await theGraphClientStarterkits.request(AssetsEventsQuery);

  // return data;
  return {
    assetActivityDatas: [
      {
        id: 'stablecoin',
        mintEventCount: 0,
        burnEventCount: 0,
        transferEventCount: 0,
      },
      {
        id: 'fund',
        mintEventCount: 0,
        burnEventCount: 0,
        transferEventCount: 0,
      },
      {
        id: 'equity',
        mintEventCount: 0,
        burnEventCount: 0,
        transferEventCount: 0,
      },
    ],
  };
}
