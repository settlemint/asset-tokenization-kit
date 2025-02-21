import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
export const SearchAssets = theGraphGraphqlStarterkits(`
  query SearchAssets($searchAddress: Bytes!, $search: String!) {
    assets(
      where: {
        or: [
          { name_contains_nocase: $search },
          { symbol_contains_nocase: $search },
          { id: $searchAddress }
        ]
      },
      first: 10
    ) {
      id
      type
    }
  }
`);

export const SearchUsers = hasuraGraphql(`
  query SearchUsers($search: String!) {
    user(
      where: {
        _or: [
          { name: { _ilike: $search } },
          { wallet: { _ilike: $search } },
          { email: { _like: $search } }
        ]
      },
      limit: 10
    ) {
      wallet
      id
    }
  }
`);
