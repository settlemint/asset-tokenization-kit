import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder";

const EquityFactoryModule = buildModule("EquityFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const equityFactory = m.contract("EquityFactory", [forwarder]);

  return { equityFactory };
});

export default EquityFactoryModule;
