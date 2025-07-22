import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const SystemAccessManagerModule = buildModule(
  "SystemAccessManagerModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const systemAccessManager = m.contract(
      "ATKSystemAccessManagerImplementation",
      [forwarder]
    );

    return { systemAccessManager };
  }
);

export default SystemAccessManagerModule;
