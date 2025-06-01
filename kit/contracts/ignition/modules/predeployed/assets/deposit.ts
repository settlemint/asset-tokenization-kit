import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const DepositModule = buildModule("DepositModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const depositFactoryImplementation = m.contract(
    "SMARTDepositFactoryImplementation",
    [forwarder]
  );
  const depositImplementation = m.contract("SMARTDepositImplementation", [
    forwarder,
  ]);

  return { depositFactoryImplementation, depositImplementation };
});

export default DepositModule;
