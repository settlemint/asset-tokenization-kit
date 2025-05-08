import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder";

const BondFactoryModule = buildModule("BondFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const bondFactory = m.contract("BondFactory", [forwarder]);

  return { bondFactory };
});

export default BondFactoryModule;
