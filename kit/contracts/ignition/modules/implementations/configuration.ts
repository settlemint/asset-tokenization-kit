import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import IdentityRegistryModule from "./identity-registry";
import IdentityRegistryStorageModule from "./identity-registry-storage";

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

export default ConfigurationModule;
