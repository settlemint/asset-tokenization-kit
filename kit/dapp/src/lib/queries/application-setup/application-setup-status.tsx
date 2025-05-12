import { ApplicationSetupStatusSchema } from "@/lib/queries/application-setup/application-setup-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { fetchAllPortalPages } from "../../pagination";
import { safeParse } from "../../utils/typebox";

const getContractsQuery = portalGraphql(`
  query getContracts {
    getContracts {
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
    // TODO: improve filtering capabilities
    const response = await portalClient.request(
      getContractsQuery,
      {
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

  const deployedContracts =
    contracts.records
      .filter((record) => record.address && record.abiName)
      .map((record) => ({
        address: record.address!,
        abiName: record.abiName!,
      })) ?? [];

  return safeParse(ApplicationSetupStatusSchema, {
    isSetup: (contracts.count ?? 0) > 0,
    deployedContracts,
  });
}
