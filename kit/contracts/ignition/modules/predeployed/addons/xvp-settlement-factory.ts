import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const XvPSettlementFactoryModule = buildModule(
  "XvPSettlementFactoryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const xvpSettlementFactoryImplementation = m.contract(
      "ATKXvPSettlementFactoryImplementation",
      [forwarder]
    );

    return { xvpSettlementFactoryImplementation };
  }
);

export default XvPSettlementFactoryModule;
