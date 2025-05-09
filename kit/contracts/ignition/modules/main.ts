import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./implementations/forwarder";

const AssetTokenizationModule = buildModule("AssetTokenizationModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  return {
    forwarder,
  };
});

export default AssetTokenizationModule;
