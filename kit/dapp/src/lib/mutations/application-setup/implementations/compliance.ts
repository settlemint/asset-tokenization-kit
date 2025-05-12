import type { User } from "@/lib/auth/types";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

const deployContractSMARTComplianceMutation = portalGraphql(`
  mutation deployContractSMARTCompliance($from: String!, $constructorArguments: DeployContractSMARTComplianceInput!) {
    DeployContract: DeployContractSMARTCompliance(from: $from, constructorArguments: $constructorArguments) {
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

const initializeComplianceMutation = portalGraphql(`
  mutation SMARTComplianceInitialize($from: String!, $address: String!, $input: SMARTComplianceInitializeInput!) {
    SMARTComplianceInitialize(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface ComplianceModuleArgs {
  forwarder: Address;
  user: User;
}

export const complianceModule = async ({
  forwarder,
  user,
}: ComplianceModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartComplianceResult = await portalClient.request(
    deployContractSMARTComplianceMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder,
      },
    }
  );
  const complianceImpl = await waitForContractToBeDeployed(
    deploySmartComplianceResult.DeployContract?.transactionHash
  );

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const deploySmartProxyResult = await portalClient.request(
    deployContractSMARTProxyMutation,
    {
      from: user.wallet,
      constructorArguments: {
        _data: complianceImpl,
        _logic: emptyInitData,
      },
    }
  );
  const complianceProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize
  const initializeComplianceResult = await portalClient.request(
    initializeComplianceMutation,
    {
      from: user.wallet,
      address: complianceProxy,
      input: {
        initialAdmin: user.wallet,
      },
    }
  );
  await waitForTransactionToBeMined(
    initializeComplianceResult.SMARTComplianceInitialize?.transactionHash
  );

  return {
    complianceImplementation: complianceImpl,
    complianceProxy: complianceImpl,
  };
};
