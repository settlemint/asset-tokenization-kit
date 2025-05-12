import type { User } from "@/lib/auth/types";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

const deployContractSMARTTrustedIssuersRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTrustedIssuersRegistry($from: String!, $constructorArguments: DeployContractSMARTTrustedIssuersRegistryInput!) {
    DeployContract: DeployContractSMARTTrustedIssuersRegistry(from: $from, constructorArguments: $constructorArguments) {
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

const initializeIssuersRegistryMutation = portalGraphql(`
  mutation SMARTTrustedIssuersRegistryInitialize($from: String!, $address: String!, $input: SMARTTrustedIssuersRegistryInitializeInput!) {
    SMARTTrustedIssuersRegistryInitialize(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface TrustedIssuersRegistryModuleArgs {
  forwarder: Address;
  user: User;
}

export const trustedIssuersRegistryModule = async ({
  forwarder,
  user,
}: TrustedIssuersRegistryModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartTrustedIssuersRegistryResult = await portalClient.request(
    deployContractSMARTTrustedIssuersRegistryMutation,
    {
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
