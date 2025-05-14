import { handleChallenge } from "@/lib/challenge";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { SetupApplicationArgs } from "../application-setup-function";

const deployContractSMARTTrustedIssuersRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTrustedIssuersRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTTrustedIssuersRegistryInput!
  ) {
    DeployContract: DeployContractSMARTTrustedIssuersRegistry(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments
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
  ) {
    DeployContract: DeployContractSMARTProxy(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments
    ) {
      transactionHash
    }
  }
`);

const initializeIssuersRegistryMutation = portalGraphql(`
  mutation SMARTTrustedIssuersRegistryInitialize(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTTrustedIssuersRegistryInitializeInput!
  ) {
    SMARTTrustedIssuersRegistryInitialize(
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

interface TrustedIssuersRegistryModuleArgs extends SetupApplicationArgs {
  forwarder: Address;
}

export const trustedIssuersRegistryModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
}: TrustedIssuersRegistryModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartTrustedIssuersRegistryResult = await portalClient.request(
    deployContractSMARTTrustedIssuersRegistryMutation,
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
    }
  );
  const issuersImpl = await waitForContractToBeDeployed(
    deploySmartTrustedIssuersRegistryResult.DeployContract?.transactionHash
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
        _data: issuersImpl,
        _logic: emptyInitData,
      },
    }
  );
  const issuersProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize
  const initializeIssuersRegistryResult = await portalClient.request(
    initializeIssuersRegistryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      address: issuersProxy,
      input: {
        initialAdmin: user.wallet,
      },
    }
  );
  await waitForTransactionToBeMined(
    initializeIssuersRegistryResult.SMARTTrustedIssuersRegistryInitialize
      ?.transactionHash
  );

  return {
    trustedIssuersRegistryImplementation: issuersImpl,
    trustedIssuersRegistryProxy: issuersProxy,
  };
};
