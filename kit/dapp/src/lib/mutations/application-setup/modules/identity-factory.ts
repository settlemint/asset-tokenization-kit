import type { User } from "@/lib/auth/types";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zeroAddress, type Address } from "viem";

const deployContractIdentityMutation = portalGraphql(`
  mutation deployContractSMARTIdentity($from: String!, $constructorArguments: DeployContractSMARTIdentityInput!) {
    DeployContract: DeployContractSMARTIdentity(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityImplementationAuthorityMutation =
  portalGraphql(`
    mutation deployContractSMARTIdentityImplementationAuthority($from: String!, $constructorArguments: DeployContractSMARTIdentityImplementationAuthorityInput!) {
      DeployContract: DeployContractSMARTIdentityImplementationAuthority(from: $from, constructorArguments: $constructorArguments) {
        transactionHash
      }
    }
  `);

const deployContractSMARTIdentityFactoryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityFactory($from: String!, $constructorArguments: DeployContractSMARTIdentityFactoryInput!) {
    DeployContract: DeployContractSMARTIdentityFactory(from: $from, constructorArguments: $constructorArguments) {
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

const initializeIdentityFactoryMutation = portalGraphql(`
  mutation SMARTIdentityFactoryInitialize($from: String!, $address: String!, $input: SMARTIdentityFactoryInitializeInput!) {
    SMARTIdentityFactoryInitialize(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface IdentityFactoryModuleArgs {
  forwarder: Address;
  user: User;
}

export const identityFactoryModule = async ({
  forwarder,
  user,
}: IdentityFactoryModuleArgs) => {
  const deploySmartIdentityRegistryStorageResult = await portalClient.request(
    deployContractIdentityMutation,
    {
      from: user.wallet,
      constructorArguments: {
        initialManagementKey: zeroAddress,
        _isLibrary: true,
      },
    }
  );
  const identityImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryStorageResult.DeployContract?.transactionHash
  );

  const deployImplementationAuthorityResult = await portalClient.request(
    deployContractSMARTIdentityImplementationAuthorityMutation,
    {
      from: user.wallet,
      constructorArguments: {
        implementation: identityImpl,
      },
    }
  );
  const implementationAuthorityImpl = await waitForContractToBeDeployed(
    deployImplementationAuthorityResult.DeployContract?.transactionHash
  );

  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityFactoryResult = await portalClient.request(
    deployContractSMARTIdentityFactoryMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder,
      },
    }
  );
  const factoryImpl = await waitForContractToBeDeployed(
    deploySmartIdentityFactoryResult.DeployContract?.transactionHash
  );

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const deploySmartProxyResult = await portalClient.request(
    deployContractSMARTProxyMutation,
    {
      from: user.wallet,
      constructorArguments: {
        _data: factoryImpl,
        _logic: emptyInitData,
      },
    }
  );
  const factoryProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize with deployer, storageProxy, and issuersProxy
  const initializeIdentityFactoryResult = await portalClient.request(
    initializeIdentityFactoryMutation,
    {
      from: user.wallet,
      address: factoryProxy,
      input: {
        initialOwner: user.wallet,
        implementationAuthority_: implementationAuthorityImpl,
      },
    }
  );
  await waitForTransactionToBeMined(
    initializeIdentityFactoryResult.SMARTIdentityFactoryInitialize
      ?.transactionHash
  );

  return {
    identityFactoryImplementation: factoryImpl,
    identityFactoryProxy: factoryProxy,
  };
};
