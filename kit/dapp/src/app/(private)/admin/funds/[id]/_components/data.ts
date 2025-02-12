import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const FundTitle = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
     id
    name
    symbol
    decimals
<<<<<<< HEAD
    paused
=======
>>>>>>> origin/main
    }
  }
`
);

export async function getFundTitle(id: string) {
  const data = await theGraphClientStarterkits.request(FundTitle, { id });
  if (!data.fund) {
    throw new Error('Fund not found');
  }
  return data.fund;
}
