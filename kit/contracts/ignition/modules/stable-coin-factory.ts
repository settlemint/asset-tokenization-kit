import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import EASModule from "./eas";
import ForwarderModule from "./forwarder";

const StableCoinFactoryModule = buildModule("StableCoinFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { eas } = m.useModule(EASModule);

  const stableCoinFactory = m.contract("StableCoinFactory", [forwarder, eas]);

  return { stableCoinFactory };
});

export default StableCoinFactoryModule;
