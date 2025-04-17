import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const FundFactoryModule = buildModule("FundFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { eas } = m.useModule(EASModule);

  const fundFactory = m.contract("FundFactory", [forwarder, eas]);

  return { fundFactory };
});

export default FundFactoryModule;
