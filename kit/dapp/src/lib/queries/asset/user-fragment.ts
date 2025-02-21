import { hasuraGraphql } from '@/lib/settlemint/hasura';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const UserFragment = hasuraGraphql(`
  fragment UserFragment on user {
    id
    name
    image
    email
    wallet
  }
`);
export type User = FragmentOf<typeof UserFragment>;
