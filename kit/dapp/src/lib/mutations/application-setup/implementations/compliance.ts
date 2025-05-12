import type { User } from "@/lib/auth/types";
import { waitForContractToBeDeployed } from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zeroAddress, type Address } from "viem";

const deployContractSMARTComplianceMutation = portalGraphql(`
  mutation deployContractSMARTCompliance($from: String!, $constructorArguments: DeployContractSMARTComplianceInput!) {
    DeployContract: DeployContractSMARTCompliance(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

interface ComplianceModuleArgs {
  forwarder: Address | null;
  user: User;
}

interface ComplianceModuleResult {
  complianceImplementation: Address;
  complianceProxy: Address;
  compliance: Address;
}

export const complianceModule = async ({
  forwarder,
  user,
}: ComplianceModuleArgs): Promise<ComplianceModuleResult> => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartComplianceResult = await portalClient.request(
    deployContractSMARTComplianceMutation,
    {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }
  );
  const complianceImpl = await waitForContractToBeDeployed(
    deploySmartComplianceResult.DeployContract?.transactionHash
  );

  /*
  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const complianceProxy = m.contract(
    "SMARTProxy",
    [complianceImpl, emptyInitData],
    { id: "ComplianceProxy" }
  );

  // Get a contract instance at the proxy address
  const compliance = m.contractAt("SMARTCompliance", complianceProxy, {
    id: "ComplianceAtProxyUninitialized", // Renamed to reflect state
  });

  // Call initialize
  m.call(compliance, "initialize", [deployer], {
    id: "InitializeCompliance",
    after: [complianceProxy], // Ensure proxy is deployed and contractAt is available
  });
  */

  return {
    complianceImplementation: complianceImpl,
    complianceProxy: complianceImpl, // TODO
    compliance: complianceImpl, // TODO
  };
};
