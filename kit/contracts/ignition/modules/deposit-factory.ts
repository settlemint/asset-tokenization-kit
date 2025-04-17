import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const DepositFactoryModule = buildModule("DepositFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { eas } = m.useModule(EASModule);

  const depositFactory = m.contract("DepositFactory", [forwarder, eas]);

  return { depositFactory };
});

export default DepositFactoryModule;
