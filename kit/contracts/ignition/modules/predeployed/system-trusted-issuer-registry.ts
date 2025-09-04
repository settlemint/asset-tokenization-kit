import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const SystemTrustedIssuerRegistryModule = buildModule(
  "TrustedIssuerRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const systemTrustedIssuerRegistry = m.contract(
      "ATKSystemTrustedIssuersRegistryImplementation",
      [forwarder]
    );

    return { systemTrustedIssuerRegistry };
  }
);

export default SystemTrustedIssuerRegistryModule;
