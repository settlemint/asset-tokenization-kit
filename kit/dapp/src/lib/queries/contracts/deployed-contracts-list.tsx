import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { ResultOf, VariablesOf } from "gql.tada";

const getContractsQuery = portalGraphql(`
  query getContracts($abiName: String) {
    getContracts(abiName: $abiName) {
      count
      records {
        address
        abiName
      }
    }
  }
`);

type GetContractsResponse = ResultOf<typeof getContractsQuery>;
type GetContractsVariables = VariablesOf<typeof getContractsQuery>;

export async function getContracts(
  variables: GetContractsVariables
): Promise<GetContractsResponse> {
  return await portalClient.request(getContractsQuery, variables);
}
