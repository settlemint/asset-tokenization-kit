import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const SystemAddonRegistryModule = buildModule(
  "SystemAddonRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const systemAddonRegistry = m.contract(
      "ATKSystemAddonRegistryImplementation",
      [forwarder]
    );
    return { systemAddonRegistry };
  }
);

export default SystemAddonRegistryModule;
