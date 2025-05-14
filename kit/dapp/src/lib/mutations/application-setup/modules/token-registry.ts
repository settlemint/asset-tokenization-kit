import { handleChallenge } from "@/lib/challenge";
import { waitForContractToBeDeployed } from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { SetupApplicationArgs } from "../application-setup-function";

const deployContractTokenRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTokenRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $constructorArguments: DeployContractSMARTTokenRegistryInput!
  ) {
    DeployContract: DeployContractSMARTTokenRegistry(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      constructorArguments: $constructorArguments
    ) {
      transactionHash
    }
  }
`);

interface TokenRegistryModuleArgs extends SetupApplicationArgs {
  forwarder: Address;
}

export const tokenRegistryModule = async ({
  forwarder,
  user,
  verificationCode,
  verificationType,
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
    }
  );
  const tokenRegistry = await waitForContractToBeDeployed(
    deploySmartTokenRegistryResult.DeployContract?.transactionHash
  );
  return {
    tokenRegistry,
  };
};
