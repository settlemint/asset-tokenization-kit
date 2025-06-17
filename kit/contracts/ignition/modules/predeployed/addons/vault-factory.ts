import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const VaultFactoryModule = buildModule("VaultFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const vaultFactoryImplementation = m.contract(
    "ATKVaultFactoryImplementation",
    [forwarder]
  );

  return { vaultFactoryImplementation };
});

export default VaultFactoryModule;
