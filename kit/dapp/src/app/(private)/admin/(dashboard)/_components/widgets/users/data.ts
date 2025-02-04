'use server';

import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';

const UsersQuery = hasuraGraphql(`
  query UsersQuery {
    user_aggregate {
      nodes {
        id
      }
    }
    recent_users_aggregate: user_aggregate(
      where: { created_at: { _gt: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" } }
    ) {
      aggregate {
        count
      }
    }
  }
`);

export async function getUserWidgetData() {
  const data = await hasuraClient.request(UsersQuery);

  return {
    totalUsers: data.user_aggregate.nodes.length,
    usersInLast24Hours: data.recent_users_aggregate.aggregate?.count ?? 0,
  };
}
