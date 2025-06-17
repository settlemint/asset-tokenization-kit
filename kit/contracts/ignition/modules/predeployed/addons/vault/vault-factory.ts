import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../../forwarder";

/**
 * @summary ATK Vault Factory Implementation Deployment Module
 * @dev This module deploys the implementation contract for the ATKVaultFactory.
 * Note: The actual ATKVaultFactoryImplementation contract is located at /contracts/addons/vault/ATKVaultFactoryImplementation.sol
 */
const VaultFactoryModule = buildModule("VaultFactoryModule", (m) => {
  // Import the forwarder dependency
  const { forwarder } = m.useModule(ForwarderModule);

  // Deploy the ATKVaultFactory implementation
  const vaultFactoryImplementation = m.contract(
    "ATKVaultFactoryImplementation",
    [forwarder],
    {
      id: "ATKVaultFactoryImplementation",
    }
  );

  return {
    vaultFactoryImplementation,
  };
});

export default VaultFactoryModule;
