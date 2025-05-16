import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder";

const VaultFactoryModule = buildModule("VaultFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const vaultFactory = m.contract("VaultFactory", [forwarder]);

  return { vaultFactory };
});

export default VaultFactoryModule;
