import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const EquityFactoryModule = buildModule("EquityFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { eas } = m.useModule(EASModule);

  const equityFactory = m.contract("EquityFactory", [forwarder, eas]);

  return { equityFactory };
});

export default EquityFactoryModule;
