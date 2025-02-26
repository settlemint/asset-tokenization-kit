import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const FixedYieldFactoryModule = buildModule("FixedYieldFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const fixedYieldFactory = m.contract("FixedYieldFactory", [forwarder]);

  return { fixedYieldFactory };
});

export default FixedYieldFactoryModule;
