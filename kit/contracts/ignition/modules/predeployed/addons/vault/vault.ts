import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../../forwarder";

/**
 * @summary ATK Vault Implementation Deployment Module
 * @dev This module deploys the implementation contract for ATKVault.
 * Note: The actual ATKVault contract is located at /contracts/addons/vault/ATKVault.sol
 */
const ATKVaultModule = buildModule("ATKVault", (m) => {
  // Import the forwarder dependency
  const { forwarder } = m.useModule(ForwarderModule);

  // Deploy the ATKVault implementation
  // Note: The contract is now located at contracts/system/addons/vault/ATKVault.sol
  const atkVaultImplementation = m.contract(
    "ATKVault",
    [
      [], // Empty signers array for implementation
      1, // Minimum required for implementation
      m.getAccount(0), // Placeholder initial owner for implementation
      forwarder,
    ],
    {
      id: "ATKVault_Implementation",
    }
  );

  return {
    atkVaultImplementation,
  };
});

export default ATKVaultModule;
