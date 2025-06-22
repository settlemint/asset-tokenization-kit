import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../../forwarder";

const TimeboundAirdropFactoryModule = buildModule(
  "TimeboundAirdropFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const timeboundAirdropFactoryImplementation = m.contract(
      "ATKTimeboundAirdropFactoryImplementation",
      [forwarder]
    );

    return { timeboundAirdropFactoryImplementation };
  }
);

export default TimeboundAirdropFactoryModule;
