import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
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
    [[deployer, signer1, signer2], 2],
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

  m.call(vault, "pause", [], {
    id: "pauseVault",
    from: deployer,
  });

  const unpauseVault = m.call(vault, "unpause", [], {
    id: "unpauseVault",
    from: deployer,
  });

  m.send("sendETHToVault", vault, 1_000_000_000_000_000_000n, undefined, {
    from: deployer,
    after: [unpauseVault],
  });

  return { vault };
});

export default VaultsModule;
