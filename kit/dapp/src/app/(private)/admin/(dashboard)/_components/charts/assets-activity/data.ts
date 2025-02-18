import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';

const AssetsEventsQuery = theGraphGraphqlStarterkits(`
  query AssetActivityData($first: Int, $skip: Int) {
    assetActivityDatas(first: $first, skip: $skip) {
      id
      assetType
      burnEventCount
      mintEventCount
      transferEventCount
    }
  }
`);

export function getAssetsEventsData() {
  return fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(AssetsEventsQuery, { first, skip });
    return result.assetActivityDatas;
  });
}
