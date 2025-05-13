import {
  ApplicationSetupStatusSchema,
  type ApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { ResultOf } from "@settlemint/sdk-portal";
import type { Client } from "graphql-ws";
import { fetchAllPortalPages } from "../../pagination";
import { safeParse } from "../../utils/typebox";

const ABI_NAMES = [
  "CountryAllowListComplianceModule",
  "CountryBlockListComplianceModule",
  "SMARTCompliance",
  "SMARTDeploymentRegistry",
  "SMARTIdentity",
  "SMARTIdentityFactory",
  "SMARTIdentityImplementationAuthority",
  "SMARTIdentityRegistry",
  "SMARTIdentityRegistryStorage",
  "SMARTProxy",
  "SMARTTokenRegistry",
  "SMARTTrustedIssuersRegistry",
];

const getContractsQuery = portalGraphql(`
  query getContracts($abiNames: [String!]!) {
    getContracts(abiNames: $abiNames) {
      count
      records {
        createdAt
        address
        abiName
      }
    }
  }
`);

export async function getApplicationSetupStatus() {
  const contracts = await fetchAllPortalPages(async ({ page, pageSize }) => {
    const response = await portalClient.request(
      getContractsQuery,
      {
        abiNames: ABI_NAMES,
        pageSize,
        page,
      },
      {
        "X-GraphQL-Operation-Name": "getContracts",
        "X-GraphQL-Operation-Type": "query",
      }
    );

    return {
      count: response.getContracts?.count ?? 0,
      records: response.getContracts?.records ?? [],
    };
  });

  return getApplicationStatus(contracts);
}

export async function subscribeToApplicationSetupStatus(
  client: Client,
  onStatusChange: (status: ApplicationSetupStatus) => void
) {
  const query = `subscription getContracts($abiNames: [String!]!) {
    getContracts(abiNames: $abiNames) {
      count
      records {
        createdAt
        address
        abiName
      }
    }
  }` as const;
  type getContractsQuery = typeof portalGraphql<typeof query, []>;
  type GetContractsQueryResponse = ResultOf<ReturnType<getContractsQuery>>;

  const subscription = client.iterate<GetContractsQueryResponse>({
    query,
    variables: {
      abiNames: ABI_NAMES,
    },
  });

  for await (const result of subscription) {
    if (Array.isArray(result?.data?.getContracts?.records)) {
      onStatusChange(getApplicationStatus(result?.data?.getContracts));
    }
  }
}

function getApplicationStatus(
  contracts: ResultOf<typeof getContractsQuery>["getContracts"]
) {
  const deployedContracts =
    contracts?.records
      .filter((record) => record.address && record.abiName)
      .map((record) => ({
        address: record.address!,
        abiName: record.abiName!,
      })) ?? [];

  return safeParse(ApplicationSetupStatusSchema, {
    isSetup: (contracts?.count ?? 0) > 0,
    deployedContracts,
  });
}
