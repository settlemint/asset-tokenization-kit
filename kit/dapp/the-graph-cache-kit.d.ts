/* eslint-disable */
/* prettier-ignore */
import type { TadaDocumentNode, $tada } from 'gql.tada';

declare module 'gql.tada' {
 interface setupCache {
    "\n  query ListSystemQuery($skip: Int!, $orderDirection: OrderDirection = asc, $orderBy: System_orderBy = id, $first: Int = 20) {\n    systems(\n        first: $first\n        orderBy: $orderBy\n        orderDirection: $orderDirection\n        skip: $skip\n      ) {\n      id\n    }\n  }\n":
      TadaDocumentNode<{ systems: { id: string; }[]; }, { first?: number | null | undefined; orderBy?: "id" | "account" | "accessControl" | "accessControl__id" | "account__id" | "account__isContract" | "account__country" | "compliance" | "compliance__id" | "identityRegistryStorage" | "identityRegistryStorage__id" | "identityFactory" | "identityFactory__id" | "identityRegistry" | "identityRegistry__id" | "trustedIssuersRegistry" | "trustedIssuersRegistry__id" | "topicSchemeRegistry" | "topicSchemeRegistry__id" | "tokenFactories" | null | undefined; orderDirection?: "asc" | "desc" | null | undefined; skip: number; }, void>;
    "\n  fragment IndexingFragment on _Block_ {\n    number\n  }\n":
      TadaDocumentNode<{ number: number; }, {}, { fragment: "IndexingFragment"; on: "_Block_"; masked: false; }>;
    "\n  fragment PermissionFragment on Account {\n    id\n    lastActivity\n  }\n":
      TadaDocumentNode<{ id: string; lastActivity: unknown; }, {}, { fragment: "PermissionFragment"; on: "Account"; masked: false; }>;
    "\n  query TotalAssetSuplies {\n    assets(where: {totalSupplyExact_gt: \"0\"}) {\n      id\n      totalSupply\n    }\n  }\n":
      TadaDocumentNode<{ assets: unknown; }, {}, void>;
    "\n  fragment PortfolioAccountFragment on Account {\n    id\n  }\n":
      TadaDocumentNode<{ id: string; }, {}, { fragment: "PortfolioAccountFragment"; on: "Account"; masked: false; }>;
    "\n  fragment AccountFragment on Account {\n    id\n    lastActivity\n    balancesCount\n  }\n":
      TadaDocumentNode<{ id: string; lastActivity: unknown; balancesCount: unknown; }, {}, { fragment: "AccountFragment"; on: "Account"; masked: false; }>;
  }
}
