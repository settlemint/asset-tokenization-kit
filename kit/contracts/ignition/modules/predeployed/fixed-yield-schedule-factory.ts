import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const FixedYieldScheduleFactoryModule = buildModule(
  "FixedYieldScheduleFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const fixedYieldScheduleFactory = m.contract(
      "SMARTFixedYieldScheduleFactory",
      [forwarder]
    );

    return { fixedYieldScheduleFactory };
  }
);

export default FixedYieldScheduleFactoryModule;
