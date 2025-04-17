import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const BondFactoryModule = buildModule("BondFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { eas } = m.useModule(EASModule);

  const bondFactory = m.contract("BondFactory", [forwarder, eas]);

  return { bondFactory };
});

export default BondFactoryModule;
