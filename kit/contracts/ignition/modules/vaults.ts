import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import StableCoinsModule from "./stable-coins";
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

  const pauseVault = m.call(vault, "pause", [], {
    id: "pauseVault",
    from: deployer,
  });

  const unpauseVault = m.call(vault, "unpause", [], {
    id: "unpauseVault",
    from: deployer,
    after: [pauseVault],
  });

  m.send("sendETHToVault", vault, 1_000_000_000_000_000_000n, undefined, {
    from: deployer,
    after: [unpauseVault],
  });

  const payoutETH = m.call(
    vault,
    "submitTransaction",
    [deployer, 100000000n, "0x", "Payout ETH"],
    {
      id: "submitETHTransfer",
      from: signer1,
      after: [unpauseVault],
    }
  );

  const readTxIndex2 = m.readEventArgument(
    payoutETH,
    "SubmitTransaction",
    "txIndex",
    { id: "readTxIndex2" }
  );

  m.call(vault, "confirm", [readTxIndex2], {
    id: "confirmPayoutETH",
    from: signer2,
    after: [payoutETH],
  });

  const { usdc } = m.useModule(StableCoinsModule);

  const depositUSDC = m.call(usdc, "transfer", [vault, 200000000n], {
    id: "depositUSDC",
    from: deployer,
    after: [unpauseVault],
  });

  const payoutUSDC = m.call(
    vault,
    "submitERC20Transfer",
    [usdc, deployer, 100000000n, "Payout USDC"],
    {
      id: "submitERC20Transfer",
      from: signer1,
      after: [depositUSDC],
    }
  );

  const readTxIndex = m.readEventArgument(
    payoutUSDC,
    "SubmitERC20TransferTransaction",
    "txIndex",
    { id: "readTxIndex" }
  );

  m.call(vault, "confirm", [readTxIndex], {
    id: "confirmPayoutUSDC",
    from: signer2,
    after: [payoutUSDC],
  });

  return { vault };
});

export default VaultsModule;
