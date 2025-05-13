import type { User } from "@/lib/auth/types";
import { waitForContractToBeDeployed } from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

const deployContractTokenRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTokenRegistry($from: String!, $constructorArguments: DeployContractSMARTTokenRegistryInput!) {
    DeployContract: DeployContractSMARTTokenRegistry(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

interface TokenRegistryModuleArgs {
  forwarder: Address;
  user: User;
}

export const tokenRegistryModule = async ({
  forwarder,
  user,
}: TokenRegistryModuleArgs) => {
  const deploySmartTokenRegistryResult = await portalClient.request(
    deployContractTokenRegistryMutation,
    {
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
