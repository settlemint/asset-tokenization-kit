import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const EquityModule = buildModule("EquityModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const equityFactoryImplementation = m.contract(
    "SMARTEquityFactoryImplementation",
    [forwarder]
  );
  const equityImplementation = m.contract("SMARTEquityImplementation", [
    forwarder,
  ]);

  return { equityFactoryImplementation, equityImplementation };
});

export default EquityModule;
