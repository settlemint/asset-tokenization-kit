import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../../forwarder";

const PushAirdropFactoryModule = buildModule(
  "PushAirdropFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const pushAirdropFactoryImplementation = m.contract(
      "ATKPushAirdropFactoryImplementation",
      [forwarder]
    );

    return { pushAirdropFactoryImplementation };
  }
);

export default PushAirdropFactoryModule;
