import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../../forwarder";

const VaultModule = buildModule("VaultModule", (m) => {
  // Import the forwarder dependency
  const { forwarder } = m.useModule(ForwarderModule);

  // Deploy the ATKVault implementation
  const atkVaultImplementation = m.contract("ATKVault", [
    [], // Empty signers array for implementation
    1, // Minimum required for implementation
    m.getAccount(0), // Placeholder initial owner for implementation
    forwarder,
  ]);

  return {
    atkVaultImplementation,
  };
});

export default VaultModule;
