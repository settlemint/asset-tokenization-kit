import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const TrustedIssuersRegistryModule = buildModule(
  "TrustedIssuersRegistryModule",
  (m) => {
    // Define the trustedForwarder parameter
    const { forwarder } = m.useModule(ForwarderModule);

    const deployer = m.getAccount(0);

    // Deploy implementation contract, passing the forwarder address
    const issuersImpl = m.contract("SMARTTrustedIssuersRegistry", [forwarder]);

    // Deploy proxy with empty initialization data
    const emptyInitData = "0x";
    const issuersProxy = m.contract(
      "SMARTProxy",
      [issuersImpl, emptyInitData],
      { id: "IssuersProxy" }
    );

    // Get a contract instance at the proxy address
    const trustedIssuersRegistry = m.contractAt(
      "SMARTTrustedIssuersRegistry",
      issuersProxy,
      { id: "IssuersAtProxyUninitialized" }
    );

    // Call initialize
    m.call(trustedIssuersRegistry, "initialize", [deployer], {
      id: "InitializeIssuersRegistry",
      after: [issuersProxy],
    });

    return {
      trustedIssuersRegistryImplementation: issuersImpl,
      trustedIssuersRegistryProxy: issuersProxy,
      trustedIssuersRegistry: trustedIssuersRegistry,
    };
  }
);

export default TrustedIssuersRegistryModule;
