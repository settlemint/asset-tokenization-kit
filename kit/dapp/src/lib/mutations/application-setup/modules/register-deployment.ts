import type { User } from "@/lib/auth/types";
import { SMART_DEPLOYMENT_REGISTRY_ADDRESS } from "@/lib/contracts";
import { waitForTransactionToBeMined } from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

interface RegisterDeploymentModuleArgs {
  user: User;
  compliance: Address;
  identityRegistryStorage: Address;
  identityFactory: Address;
  identityRegistry: Address;
  trustedIssuersRegistry: Address;
  tokenRegistry: Address;
}

const registerDeploymentMutation = portalGraphql(`
  mutation RegisterDeployment($from: String!, $address: String!, $input: SMARTDeploymentRegistryRegisterDeploymentInput!) {
    SMARTDeploymentRegistryRegisterDeployment(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

const registerTokenRegistryMutation = portalGraphql(`
  mutation RegisterTokenRegistry($from: String!, $address: String!, $input: SMARTDeploymentRegistryRegisterTokenRegistryInput!) {
    SMARTDeploymentRegistryRegisterTokenRegistry(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

export const registerDeploymentModule = async ({
  user,
  compliance,
  identityRegistryStorage,
  identityFactory,
  identityRegistry,
  trustedIssuersRegistry,
  tokenRegistry,
}: RegisterDeploymentModuleArgs) => {
  const registerDeploymentResult = await portalClient.request(
    registerDeploymentMutation,
    {
      from: user.wallet,
      address: SMART_DEPLOYMENT_REGISTRY_ADDRESS,
      input: {
        _complianceContract: compliance,
        _identityRegistryStorageContract: identityRegistryStorage,
        _identityFactoryContract: identityFactory,
        _identityRegistryContract: identityRegistry,
        _trustedIssuersRegistryContract: trustedIssuersRegistry,
        _tokenRegistryContract: tokenRegistry,
      },
    }
  );
  await waitForTransactionToBeMined(
    registerDeploymentResult.SMARTDeploymentRegistryRegisterDeployment
      ?.transactionHash
  );

  const registerTokenRegistryResult = await portalClient.request(
    registerTokenRegistryMutation,
    {
      from: user.wallet,
      address: SMART_DEPLOYMENT_REGISTRY_ADDRESS,
      input: {
        _registryAddress: tokenRegistry,
        _typeName: "deposit",
      },
    }
  );
  await waitForTransactionToBeMined(
    registerTokenRegistryResult.SMARTDeploymentRegistryRegisterTokenRegistry
      ?.transactionHash
  );
};
