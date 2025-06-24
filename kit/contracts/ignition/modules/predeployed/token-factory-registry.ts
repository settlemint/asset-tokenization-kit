import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const TokenFactoryRegistryModule = buildModule(
  "TokenFactoryRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const tokenFactoryRegistry = m.contract(
      "ATKTokenFactoryRegistryImplementation",
      [forwarder]
    );
    return { tokenFactoryRegistry };
  }
);

export default TokenFactoryRegistryModule;
