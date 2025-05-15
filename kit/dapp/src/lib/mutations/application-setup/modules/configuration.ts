import { handleChallenge } from "@/lib/challenge";
import { waitForTransactionToBeMined } from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { DeployContractArgs } from "../application-setup-function";

const smartIdentityRegistryStorageBindIdentityRegistryMutation = portalGraphql(`
  mutation SMARTIdentityRegistryStorageBindIdentityRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTIdentityRegistryStorageBindIdentityRegistryInput!
  ) {
    SMARTIdentityRegistryStorageBindIdentityRegistry(
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

interface ConfigurationModuleArgs extends DeployContractArgs {
  identityRegistry: Address;
  identityRegistryStorage: Address;
}

export const configurationModule = async ({
  user,
  identityRegistry,
  identityRegistryStorage,
  verificationCode,
  verificationType,
}: ConfigurationModuleArgs) => {
  // Bind the identity registry to the storage contract
  const bindIdentityRegistryResult = await portalClient.request(
    smartIdentityRegistryStorageBindIdentityRegistryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      address: identityRegistryStorage,
      input: {
        _identityRegistry: identityRegistry,
      },
    }
  );
  await waitForTransactionToBeMined(
    bindIdentityRegistryResult.SMARTIdentityRegistryStorageBindIdentityRegistry
      ?.transactionHash
  );

  return {};
};
