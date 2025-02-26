import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const StableCoinFactoryModule = buildModule("StableCoinFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const stableCoinFactory = m.contract("StableCoinFactory", [forwarder]);

  return { stableCoinFactory };
});

export default StableCoinFactoryModule;
