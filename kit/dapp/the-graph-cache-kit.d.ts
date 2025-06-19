/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\nquery ReadAccountQuery($walletAddress: ID!) {\n  account(id: $walletAddress) {\n    id\n  }\n}\n":
      TadaDocumentNode<{ account: { id: string; } | null; }, { walletAddress: string; }, void>;
    "\n  query GetIndexingStatus {\n    _meta {\n      block {\n        number\n      }\n    }\n  }\n":
      TadaDocumentNode<{ _meta: { block: { number: number; }; } | null; }, {}, void>;
    "\n  query findSystemForTransaction($deployedInTransaction: Bytes) {\n    systems(where: {deployedInTransaction: $deployedInTransaction}) {\n      id\n    }\n  }\n":
      TadaDocumentNode<{ systems: { id: string; }[]; }, { deployedInTransaction?: string | null | undefined; }, void>;
    "\n  query ListSystemQuery($skip: Int!, $orderDirection: OrderDirection = asc, $first: Int = 20) {\n    systems(\n        first: $first\n        orderDirection: $orderDirection\n        skip: $skip\n      ) {\n      id\n    }\n  }\n":
      TadaDocumentNode<{ systems: { id: string; }[]; }, { first?: number | null | undefined; orderDirection?: "asc" | "desc" | null | undefined; skip: number; }, void>;
  }
}
