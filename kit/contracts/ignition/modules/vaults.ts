import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import VaultFactoryModule from "./vault-factory";

const VaultsModule = buildModule("VaultsModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);
  const signer1 = m.getAccount(1);
  const signer2 = m.getAccount(2);

  const { vaultFactory } = m.useModule(VaultFactoryModule);

  const createVault = m.call(
    vaultFactory,
    "create",
    [[deployer, signer1, signer2], 2, deployer],
    {
      id: "createVault",
      from: deployer,
    }
  );
  const readVaultAddress = m.readEventArgument(
    createVault,
    "VaultCreated",
    "vault",
    { id: "readVaultAddress" }
  );
  const vault = m.contractAt("Vault", readVaultAddress, {
    id: "vault",
  });

  // Set up roles for the tokenized deposit
  const signerRole = keccak256(toUtf8Bytes("SIGNER_ROLE"));

  // Grant roles to the deployer
  m.call(vault, "grantRole", [signerRole, deployer], {
    id: "grantSignerRole",
  });

  return { vault };
});

export default VaultsModule;
