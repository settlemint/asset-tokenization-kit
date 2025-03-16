import { portalClient, portalGraphql } from '@/lib/settlemint/portal';

type CreateWalletResponse = {
  createWallet: null | {
    address: null | string;
  };
};

interface CreateWalletVariables {
  keyVaultId: string;
  name: string;
}

const createWalletMutation = portalGraphql(`
  mutation createUserWallet($keyVaultId: String!, $name: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: { name: $name }) {
      address
    }
  }
`);

export async function createUserWallet(
  variables: CreateWalletVariables
): Promise<CreateWalletResponse> {
  return await portalClient.request(createWalletMutation, variables);
}
