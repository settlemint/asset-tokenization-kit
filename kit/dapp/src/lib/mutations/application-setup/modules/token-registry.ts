import { handleChallenge } from "@/lib/challenge";
import { waitForContractToBeDeployed } from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const deployContractTokenRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTokenRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTTokenRegistryInput!,
    $gasLimit: String
  ) {
    DeployContract: DeployContractSMARTTokenRegistry(
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

interface TokenRegistryModuleArgs extends DeployContractArgs {
  forwarder: Address;
}

export const tokenRegistryModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
  gasLimit,
}: TokenRegistryModuleArgs) => {
  const deploySmartTokenRegistryResult = await portalClient.request(
    deployContractTokenRegistryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      constructorArguments: {
        initialAdmin: user.wallet,
        forwarder: forwarder,
      },
      gasLimit,
    }
  );
  const tokenRegistry = await waitForContractToBeDeployed(
    deploySmartTokenRegistryResult.DeployContract?.transactionHash
  );
  return {
    tokenRegistry,
  };
};
