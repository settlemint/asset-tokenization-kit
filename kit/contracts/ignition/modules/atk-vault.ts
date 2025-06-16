import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./predeployed/forwarder";

const ATKVaultModule = buildModule("ATKVaultModule", (m) => {
  // Import the forwarder dependency
  const { forwarder } = m.useModule(ForwarderModule);

  // Define example signers for local deployment
  // In production, these would be actual addresses of the signers
  const defaultAccount = m.getAccount(0); // First account from Anvil
  const signer1 = m.getAccount(1); // Second account
  const signer2 = m.getAccount(2); // Third account

  // Configure the vault parameters
  const signers = [defaultAccount, signer1, signer2]; // 3 signers
  const required = m.getParameter("required", 2); // Require 2 of 3 signatures
  const initialOwner = m.getParameter("initialOwner", defaultAccount); // Admin role

  // Deploy the ATKVault contract
  const atkVault = m.contract("ATKVault", [
    signers,
    required,
    initialOwner,
    forwarder,
  ]);

  return {
    atkVault,
    forwarder,
  };
});

export default ATKVaultModule;
