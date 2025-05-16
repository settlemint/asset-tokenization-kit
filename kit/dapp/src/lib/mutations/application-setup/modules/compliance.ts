import { handleChallenge } from "@/lib/challenge";
import {
  waitForContractToBeDeployed,
  waitForTransactionToBeMined,
} from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const deployContractSMARTComplianceMutation = portalGraphql(`
  mutation deployContractSMARTCompliance(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTComplianceInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTCompliance(
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

const initializeComplianceMutation = portalGraphql(`
  mutation SMARTComplianceInitialize(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTComplianceInitializeInput!,
  ) {
    SMARTComplianceInitialize(
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

interface ComplianceModuleArgs extends DeployContractArgs {
  forwarder: Address;
}

export const complianceModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
  gasLimit,
}: ComplianceModuleArgs) => {
  // Deploy implementation contract, passing the forwarder address
  const deploySmartComplianceResult = await portalClient.request(
    deployContractSMARTComplianceMutation,
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
  const complianceImpl = await waitForContractToBeDeployed(
    deploySmartComplianceResult.DeployContract?.transactionHash
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
        _data: complianceImpl,
        _logic: emptyInitData,
      },
      gasLimit,
    }
  );
  const complianceProxy = await waitForContractToBeDeployed(
    deploySmartProxyResult.DeployContract?.transactionHash
  );

  // Call initialize
  const initializeComplianceResult = await portalClient.request(
    initializeComplianceMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
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
