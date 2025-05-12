import type { User } from "@/lib/auth/types";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zeroAddress, type Address } from "viem";

const deployContractSMARTIdentityRegistryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistry($from: String!, $constructorArguments: DeployContractSMARTIdentityRegistryInput!) {
    DeployContract: DeployContractSMARTIdentityRegistry(from: $from, constructorArguments: $constructorArguments) {
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

const initializeIdentityRegistryMutation = portalGraphql(`
  mutation SMARTIdentityRegistryInitialize($from: String!, $address: String!, $input: SMARTIdentityRegistryInitializeInput!) {
    SMARTIdentityRegistryInitialize(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface IdentityRegistryModuleArgs {
  forwarder: Address | null;
  user: User;
  identityRegistryStorageProxy: Address;
  trustedIssuersRegistryProxy: Address;
}

export const identityRegistryModule = async ({
  forwarder,
  user,
  identityRegistryStorageProxy,
  trustedIssuersRegistryProxy,
}: IdentityRegistryModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityRegistryResult = await portalClient.request(
    deployContractSMARTIdentityRegistryMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }
  );
  const registryImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryResult.DeployContract?.transactionHash
  );

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const deploySmartProxyResult = await portalClient.request(
    deployContractSMARTProxyMutation,
    {
      from: user.wallet,
      constructorArguments: {
        _data: registryImpl,
        _logic: emptyInitData,
      },
    }
  );
  const registryProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize with deployer, storageProxy, and issuersProxy
  const initializeIdentityRegistryResult = await portalClient.request(
    initializeIdentityRegistryMutation,
    {
      from: user.wallet,
      address: registryProxy,
      input: {
        identityStorage_: identityRegistryStorageProxy,
        trustedIssuersRegistry_: trustedIssuersRegistryProxy,
        initialAdmin: user.wallet,
      },
    }
  );
  await waitForTransactionToBeMined(
    initializeIdentityRegistryResult.SMARTIdentityRegistryInitialize
      ?.transactionHash
  );

  return {
    identityRegistryImplementation: registryImpl,
    identityRegistryProxy: registryProxy,
  };
};
