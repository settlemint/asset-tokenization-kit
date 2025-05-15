import { handleChallenge } from "@/lib/challenge";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const deployContractSMARTIdentityRegistryStorageMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistryStorage(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTIdentityRegistryStorageInput!
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTIdentityRegistryStorage(
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
    $constructorArguments: DeployContractSMARTProxyInput!
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

const initializeIdentityRegistryStorageMutation = portalGraphql(`
  mutation SMARTIdentityRegistryStorageInitialize(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTIdentityRegistryStorageInitializeInput!
  ) {
    SMARTIdentityRegistryStorageInitialize(
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

interface IdentityRegistryStorageModuleArgs extends DeployContractArgs {
  forwarder: Address;
}

export async function identityRegistryStorageModule({
  forwarder,
  user,
  verificationCode,
  verificationType,
  gasLimit,
}: IdentityRegistryStorageModuleArgs) {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartIdentityRegistryStorageResult = await portalClient.request(
    deployContractSMARTIdentityRegistryStorageMutation,
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
  const storageImpl = await waitForContractToBeDeployed(
    deploySmartIdentityRegistryStorageResult.DeployContract?.transactionHash
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
        _data: storageImpl,
        _logic: emptyInitData,
      },
      gasLimit,
    }
  );
  const storageProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize
  const initializeIdentityRegistryStorageResult = await portalClient.request(
    initializeIdentityRegistryStorageMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
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
