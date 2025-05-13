/*
const ConfigurationModule = buildModule("ConfigurationModule", (m) => {
  // Import dependencies. Parameters are passed implicitly.
  const { identityRegistry } = m.useModule(IdentityRegistryModule);

  const { identityRegistryStorage } = m.useModule(
    IdentityRegistryStorageModule
  );

  // Bind the identity registry to the storage contract
  m.call(identityRegistryStorage, "bindIdentityRegistry", [identityRegistry], {
    id: "BindRegistryToStorage",
  });

  return {};
});
*/

import { waitForTransactionToBeMined } from "@/lib/mutations/application-setup/utils/contract-deployment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { User } from "../../../auth/types";

const smartIdentityRegistryStorageBindIdentityRegistryMutation = portalGraphql(`
  mutation SMARTIdentityRegistryStorageBindIdentityRegistry($from: String!, $address: String!, $input: SMARTIdentityRegistryStorageBindIdentityRegistryInput!) {
    SMARTIdentityRegistryStorageBindIdentityRegistry(from: $from, address: $address, input: $input) {
      transactionHash
    }
  }
`);

interface ConfigurationModuleArgs {
  user: User;
  identityRegistry: Address;
  identityRegistryStorage: Address;
}

export const configurationModule = async ({
  user,
  identityRegistry,
  identityRegistryStorage,
}: ConfigurationModuleArgs) => {
  // Bind the identity registry to the storage contract
  const bindIdentityRegistryResult = await portalClient.request(
    smartIdentityRegistryStorageBindIdentityRegistryMutation,
    {
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
