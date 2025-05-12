import type { User } from "@/lib/auth/types";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

const deployContractSMARTIdentityRegistryStorageMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistryStorage($from: String!, $constructorArguments: DeployContractSMARTIdentityRegistryStorageInput!) {
    DeployContract: DeployContractSMARTIdentityRegistryStorage(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTProxyMutation = portalGraphql(`
  mutation deployContractSMARTProxy($from: String!, $constructorArguments: DeployContractSMARTProxyInput!) {
    DeployContract: DeployContractSMARTProxy(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const initializeIdentityRegistryStorageMutation = portalGraphql(`
  mutation SMARTIdentityRegistryStorageInitialize($from: String!, $address: String!, $input: SMARTIdentityRegistryStorageInitializeInput!) {
    SMARTIdentityRegistryStorageInitialize(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface IdentityRegistryStorageModuleArgs {
  forwarder: Address;
  user: User;
}

export async function identityRegistryStorageModule({
  forwarder,
  user,
}: IdentityRegistryStorageModuleArgs) {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityRegistryStorageResult = await portalClient.request(
    deployContractSMARTIdentityRegistryStorageMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder,
      },
    }
  );
  const storageImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryStorageResult.DeployContract?.transactionHash
  );

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const deploySmartProxyResult = await portalClient.request(
    deployContractSMARTProxyMutation,
    {
      from: user.wallet,
      constructorArguments: {
        _data: storageImpl,
        _logic: emptyInitData,
      },
    }
  );
  const storageProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize
  const initializeIdentityRegistryStorageResult = await portalClient.request(
    initializeIdentityRegistryStorageMutation,
    {
      from: user.wallet,
      address: storageProxy,
      input: {
        initialAdmin: user.wallet,
      },
    }
  );
  await waitForTransactionToBeMined(
    initializeIdentityRegistryStorageResult
      .SMARTIdentityRegistryStorageInitialize?.transactionHash
  );

  return {
    identityRegistryStorageImplementation: storageImpl,
    identityRegistryStorageProxy: storageProxy,
  };
}
