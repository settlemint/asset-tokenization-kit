import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const DepositFactoryModule = buildModule("DepositFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const depositFactory = m.contract("DepositFactory", [forwarder]);

  return { depositFactory };
});

export default DepositFactoryModule;
