import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { fetchAllHasuraPages } from '@/lib/utils/pagination';

const RecentUsersQuery = hasuraGraphql(`
  query UsersQuery($createdAfter: timestamp!) {
    recent_users_aggregate: user_aggregate(
      where: { created_at: { _gt: $createdAfter } }
    ) {
      aggregate {
        count
      }
    }
  }
`);

const TotalUsersQuery = hasuraGraphql(`
  query UsersQuery($limit: Int, $offset: Int) {
    user_aggregate(limit: $limit, offset: $offset) {
      nodes {
        id
      }
    }
  }
`);

export async function getUserWidgetData() {
  const createdAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentUsers = await hasuraClient.request(RecentUsersQuery, { createdAfter });

  const totalUsers = await fetchAllHasuraPages(async (limit, offset) => {
    const result = await hasuraClient.request(TotalUsersQuery, { limit, offset });
    return result.user_aggregate.nodes;
  });

  return {
    totalUsers: totalUsers.length,
    usersInLast24Hours: recentUsers.recent_users_aggregate.aggregate?.count ?? 0,
  };
}
