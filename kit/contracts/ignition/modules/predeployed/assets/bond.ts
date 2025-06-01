import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const BondModule = buildModule("BondModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const bondFactoryImplementation = m.contract(
    "SMARTBondFactoryImplementation",
    [forwarder],
  );
  const bondImplementation = m.contract("SMARTBondImplementation", [forwarder]);

  return { bondFactoryImplementation, bondImplementation };
});

export default BondModule;
