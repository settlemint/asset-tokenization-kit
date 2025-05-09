import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";
import IdentityRegistryStorageModule from "./identity-registry-storage";
import TrustedIssuersRegistryModule from "./trusted-issuer-registry";

const IdentityRegistryModule = buildModule("IdentityRegistryModule", (m) => {
  // Define the trustedForwarder parameter
  const { forwarder } = m.useModule(ForwarderModule);

  const deployer = m.getAccount(0);

  // Import dependencies. Parameters are passed implicitly.
  const { identityRegistryStorageProxy } = m.useModule(
    IdentityRegistryStorageModule
  );
  const { trustedIssuersRegistryProxy } = m.useModule(
    TrustedIssuersRegistryModule
  );

  // Deploy implementation contract, passing the forwarder address
  const registryImpl = m.contract("SMARTIdentityRegistry", [forwarder]);

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const registryProxy = m.contract(
    "SMARTProxy",
    [registryImpl, emptyInitData],
    {
      id: "RegistryProxy",
      after: [identityRegistryStorageProxy, trustedIssuersRegistryProxy], // Explicit dependency for proxy deployment
    }
  );

  // Get a contract instance at the proxy address
  const identityRegistry = m.contractAt(
    "SMARTIdentityRegistry",
    registryProxy,
    { id: "IdentityRegistryAtProxyUninitialized" }
  );

  // Call initialize with deployer, storageProxy, and issuersProxy
  // All these are Futures and will be resolved by m.call
  m.call(
    identityRegistry,
    "initialize",
    [deployer, identityRegistryStorageProxy, trustedIssuersRegistryProxy],
    {
      id: "InitializeIdentityRegistry",
      // Ensure proxy is deployed, and dependencies for args (storageProxy, issuersProxy) are also met.
      // `after` on `registryProxy` already covers storageProxy and issuersProxy for its own deployment.
      // `m.call` will wait for `identityRegistry` (which depends on `registryProxy`) and its arguments.
      after: [registryProxy], // Or simply identityRegistry which implies registryProxy
    }
  );

  return {
    identityRegistryImplementation: registryImpl,
    identityRegistryProxy: registryProxy,
    identityRegistry: identityRegistry, // This Future now represents an initialized contract
  };
});

export default IdentityRegistryModule;
