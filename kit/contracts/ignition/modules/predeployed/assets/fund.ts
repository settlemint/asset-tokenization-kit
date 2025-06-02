import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../forwarder";

const FundModule = buildModule("FundModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const fundFactoryImplementation = m.contract(
    "SMARTFundFactoryImplementation",
    [forwarder]
  );
  const fundImplementation = m.contract("SMARTFundImplementation", [forwarder]);

  return { fundFactoryImplementation, fundImplementation };
});

export default FundModule;
