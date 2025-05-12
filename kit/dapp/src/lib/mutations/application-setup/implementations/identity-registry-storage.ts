import type { User } from "@/lib/auth/types";
import { waitForContractToBeDeployed } from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { type Address, zeroAddress } from "viem";

const deployContractSMARTIdentityRegistryStorageMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistryStorage($from: String!, $constructorArguments: DeployContractSMARTIdentityRegistryStorageInput!) {
    DeployContract: DeployContractSMARTIdentityRegistryStorage(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

interface IdentityRegistryStorageModuleArgs {
  forwarder: Address | null;
  user: User;
}

interface IdentityRegistryStorageModuleResult {
  identityRegistryStorageImplementation: Address;
  identityRegistryStorageProxy: Address;
  identityRegistryStorage: Address;
}

export async function identityRegistryStorageModule({
  forwarder,
  user,
}: IdentityRegistryStorageModuleArgs): Promise<IdentityRegistryStorageModuleResult> {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityRegistryStorageResult = await portalClient.request(
    deployContractSMARTIdentityRegistryStorageMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }
  );
  const storageImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryStorageResult.DeployContract?.transactionHash
  );

  /*
  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const storageProxy = m.contract(
    "SMARTProxy",
    [storageImpl, emptyInitData],
    {
      id: "StorageProxy",
    }
  );

  // Get a contract instance at the proxy address
  const identityRegistryStorage = m.contractAt(
    "SMARTIdentityRegistryStorage",
    storageProxy,
    { id: "StorageAtProxyUninitialized" }
  );

  // Call initialize
  m.call(identityRegistryStorage, "initialize", [deployer], {
    id: "InitializeStorage",
    after: [storageProxy],
  });
  */

  return {
    identityRegistryStorageImplementation: storageImpl,
    identityRegistryStorageProxy: storageImpl, // TODO
    identityRegistryStorage: storageImpl, // TODO
  };
}
