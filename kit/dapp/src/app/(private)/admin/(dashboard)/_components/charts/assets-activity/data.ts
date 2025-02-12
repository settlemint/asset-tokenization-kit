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

export function getAssetsEventsData() {
  return theGraphClientStarterkits.request(AssetsEventsQuery);
}
