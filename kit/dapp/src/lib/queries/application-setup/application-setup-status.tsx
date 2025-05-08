import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { fetchAllPortalPages } from "../../pagination";

const getContractsQuery = portalGraphql(`
  query getContracts {
    getContracts {
      count
      records {
        address
        abiName
      }
    }
  }
`);

export async function getApplicationSetupStatus(): Promise<{
  isSetup: boolean;
  deployedContracts: {
    address: string;
    abiName: string;
  }[];
}> {
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

  return {
    isSetup: (contracts.count ?? 0) > 0,
    deployedContracts:
      contracts.records
        .filter((record) => record.address && record.abiName)
        .map((record) => ({
          address: record.address!,
          abiName: record.abiName!,
        })) ?? [],
  };
}
