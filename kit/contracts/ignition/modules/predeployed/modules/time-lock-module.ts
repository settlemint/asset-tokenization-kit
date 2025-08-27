import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const TimeLockModule = buildModule("TimeLockModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const timeLockModule = m.contract("TimeLockComplianceModule", [
    forwarder,
  ]);

  return { timeLockModule };
});

export default TimeLockModule;