import { db } from '@/lib/db';
import { user } from '@/lib/db/schema-auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { lower } from '@/lib/utils/postgress';
import { inArray } from 'drizzle-orm';

const StablecoinBalancesFragment = theGraphGraphqlStarterkits(`
  fragment StablecoinBalancesFields on AssetBalance {
      value
      account {
        id
      }
  }
`);

const StablecoinBalances = theGraphGraphqlStarterkits(
  `
    query StablecoinBalances($id: ID!) {
    stableCoin(id: $id) {
      holders {
        ...StablecoinBalancesFields
      }
    }
  }
`,
  [StablecoinBalancesFragment]
);

export async function getStablecoinBalances(id: string) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  const { holders } = data.stableCoin;
  const users = await db.query.user.findMany({
    where: inArray(
      lower(user.wallet),
      holders.map((holder) => holder.account.id.toLowerCase())
    ),
  });
  return holders.map((holder) => {
    const user = users.find((user) => user.wallet.toLowerCase() === holder.account.id.toLowerCase());
    return {
      ...holder,
      name: user?.name ?? 'Unknown',
    };
  });
}

export type StablecoinHoldersBalance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];
