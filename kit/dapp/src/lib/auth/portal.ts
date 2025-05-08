import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { ResultOf, VariablesOf } from "gql.tada";

const createWalletMutation = portalGraphql(`
  mutation createUserWallet($keyVaultId: String!, $name: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: { name: $name }) {
      address
    }
  }
`);

type CreateWalletResponse = ResultOf<typeof createWalletMutation>;
type CreateWalletVariables = VariablesOf<typeof createWalletMutation>;

export async function createUserWallet(
  variables: CreateWalletVariables
): Promise<CreateWalletResponse> {
  return await portalClient.request(createWalletMutation, variables);
}
