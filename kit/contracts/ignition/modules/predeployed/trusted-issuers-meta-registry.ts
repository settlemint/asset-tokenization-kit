import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const TrustedIssuersMetaRegistryModule = buildModule(
  "TrustedIssuersMetaRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const trustedIssuersMetaRegistry = m.contract(
      "ATKTrustedIssuersMetaRegistryImplementation",
      [forwarder]
    );

    return { trustedIssuersMetaRegistry };
  }
);

export default TrustedIssuersMetaRegistryModule;
