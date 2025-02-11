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

  return data;
}
