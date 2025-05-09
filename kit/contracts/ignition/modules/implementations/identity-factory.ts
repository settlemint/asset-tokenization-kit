import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";
import IdentityRegistryStorageModule from "./identity-registry-storage";
import TrustedIssuersRegistryModule from "./trusted-issuer-registry";

const IdentityFactoryModule = buildModule("IdentityFactoryModule", (m) => {
  // Define the trustedForwarder parameter
  const { forwarder } = m.useModule(ForwarderModule);

  const deployer = m.getAccount(0);

  const identityImpl = m.contract("SMARTIdentity", [
    "0x0000000000000000000000000000000000000000",
    true,
  ]);
  const implementationAuthorityImpl = m.contract(
    "SMARTIdentityImplementationAuthority",
    [identityImpl]
  );

  // Import dependencies. Parameters are passed implicitly.
  const { identityRegistryStorageProxy } = m.useModule(
    IdentityRegistryStorageModule
  );
  const { trustedIssuersRegistryProxy } = m.useModule(
    TrustedIssuersRegistryModule
  );

  // Deploy implementation contract, passing the forwarder address
  const factoryImpl = m.contract("SMARTIdentityFactory", [forwarder]);

  // Deploy proxy with empty initialization data
  const emptyInitData = "0x";
  const registryProxy = m.contract("SMARTProxy", [factoryImpl, emptyInitData], {
    id: "IdentityFactoryProxy",
    after: [identityRegistryStorageProxy, trustedIssuersRegistryProxy], // Explicit dependency for proxy deployment
  });

  // Get a contract instance at the proxy address
  const identityFactory = m.contractAt("SMARTIdentityFactory", registryProxy, {
    id: "IdentityFactoryAtProxyUninitialized",
  });

  // Call initialize with deployer, storageProxy, and issuersProxy
  // All these are Futures and will be resolved by m.call
  m.call(
    identityFactory,
    "initialize",
    [deployer, implementationAuthorityImpl],
    {
      id: "InitializeIdentityFactory",
      // Ensure proxy is deployed, and dependencies for args (storageProxy, issuersProxy) are also met.
      // `after` on `registryProxy` already covers storageProxy and issuersProxy for its own deployment.
      // `m.call` will wait for `identityRegistry` (which depends on `registryProxy`) and its arguments.
      after: [registryProxy], // Or simply identityRegistry which implies registryProxy
    }
  );

  return {
    identityFactoryImplementation: factoryImpl,
    identityFactoryProxy: registryProxy,
    identityFactory: identityFactory, // This Future now represents an initialized contract
  };
});

export default IdentityFactoryModule;
