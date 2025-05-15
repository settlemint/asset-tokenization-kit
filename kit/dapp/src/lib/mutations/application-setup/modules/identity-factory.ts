import { handleChallenge } from "@/lib/challenge";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zeroAddress, type Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const deployContractIdentityMutation = portalGraphql(`
  mutation deployContractSMARTIdentity(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTIdentityInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTIdentity(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments,
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityImplementationAuthorityMutation =
  portalGraphql(`
  mutation deployContractSMARTIdentityImplementationAuthority(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTIdentityImplementationAuthorityInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTIdentityImplementationAuthority(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments,
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityFactoryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityFactory(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTIdentityFactoryInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTIdentityFactory(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments,
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const deployContractSMARTProxyMutation = portalGraphql(`
  mutation deployContractSMARTProxy(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTProxyInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTProxy(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments,
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const initializeIdentityFactoryMutation = portalGraphql(`
  mutation SMARTIdentityFactoryInitialize(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTIdentityFactoryInitializeInput!
  ) {
    SMARTIdentityFactoryInitialize(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      address: $address,
      input: $input
    ) {
      transactionHash
    }
  }
`);

interface IdentityFactoryModuleArgs extends DeployContractArgs {
  forwarder: Address;
}

export const identityFactoryModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
  gasLimit,
}: IdentityFactoryModuleArgs) => {
  const deploySmartIdentityRegistryStorageResult = await portalClient.request(
    deployContractIdentityMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      constructorArguments: {
        initialManagementKey: zeroAddress,
        _isLibrary: true,
      },
      gasLimit,
    }
  );
  const identityImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryStorageResult.DeployContract?.transactionHash
  );

  const deployImplementationAuthorityResult = await portalClient.request(
    deployContractSMARTIdentityImplementationAuthorityMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      constructorArguments: {
        implementation: identityImpl,
      },
      gasLimit,
    }
  );
  const implementationAuthorityImpl = await waitForContractToBeDeployed(
    deployImplementationAuthorityResult.DeployContract?.transactionHash
  );

  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityFactoryResult = await portalClient.request(
    deployContractSMARTIdentityFactoryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder,
      },
      gasLimit,
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
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      constructorArguments: {
        _data: factoryImpl,
        _logic: emptyInitData,
      },
      gasLimit,
    }
  );
  const factoryProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize with deployer, storageProxy, and issuersProxy
  const initializeIdentityFactoryResult = await portalClient.request(
    initializeIdentityFactoryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
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
