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
        transferEventsTo(
          first: 1
          orderBy: timestamp
          orderDirection: desc
          where: {emitter: $emitter}
        ) {
          timestamp
        }
        transferEventsFrom(
          first: 1
          orderBy: timestamp
          orderDirection: desc
          where: {emitter: $emitter}
        ) {
          timestamp
        }
      }
  }
`);

const StablecoinBalances = theGraphGraphqlStarterkits(
  `
  query StablecoinBalances($id: ID!, $emitter: String!) {
    stableCoin(id: $id) {
      symbol
      holders {
        ...StablecoinBalancesFields
      }
      admins {
        id
      }
    }
  }
`,
  [StablecoinBalancesFragment]
);

export async function getStablecoinBalances(id: string) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, { id, emitter: id });
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
    const lastActivityTimestamp =
      holder.account.transferEventsTo[0]?.timestamp ?? holder.account.transferEventsFrom[0]?.timestamp;
    return {
      ...holder,
      name: user?.name ?? 'Unknown',
      symbol: data.stableCoin?.symbol ?? 'Unknown',
      admins: data.stableCoin?.admins.map((admin) => admin.id),
      lastActivity: lastActivityTimestamp ? new Date(Number(lastActivityTimestamp) * 1000) : null,
    };
  });
}

export type StablecoinHoldersBalance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];
