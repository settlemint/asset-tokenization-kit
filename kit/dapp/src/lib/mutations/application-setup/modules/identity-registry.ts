import { handleChallenge } from "@/lib/challenge";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const deployContractSMARTIdentityRegistryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTIdentityRegistryInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTIdentityRegistry(
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

const initializeIdentityRegistryMutation = portalGraphql(`
  mutation SMARTIdentityRegistryInitialize(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTIdentityRegistryInitializeInput!
  ) {
    SMARTIdentityRegistryInitialize(
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

interface IdentityRegistryModuleArgs extends DeployContractArgs {
  forwarder: Address;
  identityRegistryStorageProxy: Address;
  trustedIssuersRegistryProxy: Address;
}

export const identityRegistryModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
  gasLimit,
  identityRegistryStorageProxy,
  trustedIssuersRegistryProxy,
}: IdentityRegistryModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityRegistryResult = await portalClient.request(
    deployContractSMARTIdentityRegistryMutation,
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
  const registryImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryResult.DeployContract?.transactionHash
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
        _data: registryImpl,
        _logic: emptyInitData,
      },
      gasLimit,
    }
  );
  const registryProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize with deployer, storageProxy, and issuersProxy
  const initializeIdentityRegistryResult = await portalClient.request(
    initializeIdentityRegistryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
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
