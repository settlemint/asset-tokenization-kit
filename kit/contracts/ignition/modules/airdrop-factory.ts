import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const AirdropFactoryModule = buildModule("AirdropFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const airdropFactory = m.contract("AirdropFactory", [forwarder]);

  return { airdropFactory };
});

export default AirdropFactoryModule;
