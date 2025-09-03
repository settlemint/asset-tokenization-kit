import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const TrustedIssuerRegistryModule = buildModule(
  "TrustedIssuerRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const trustedIssuerRegistry = m.contract(
      "ATKSystemTrustedIssuersRegistryImplementation",
      [forwarder]
    );

    return { trustedIssuerRegistry };
  }
);

export default TrustedIssuerRegistryModule;
