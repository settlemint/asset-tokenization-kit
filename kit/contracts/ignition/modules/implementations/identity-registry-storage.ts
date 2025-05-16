import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";
const IdentityRegistryStorageModule = buildModule(
  "IdentityRegistryStorageModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const deployer = m.getAccount(0);

    // Deploy implementation contract, passing the forwarder address
    const storageImpl = m.contract("SMARTIdentityRegistryStorage", [forwarder]);

    // Deploy proxy with empty initialization data
    const emptyInitData = "0x";
    const storageProxy = m.contract(
      "SMARTProxy",
      [storageImpl, emptyInitData],
      {
        id: "StorageProxy",
      }
    );

    // Get a contract instance at the proxy address
    const identityRegistryStorage = m.contractAt(
      "SMARTIdentityRegistryStorage",
      storageProxy,
      { id: "StorageAtProxyUninitialized" }
    );

    // Call initialize
    m.call(identityRegistryStorage, "initialize", [deployer], {
      id: "InitializeStorage",
      after: [storageProxy],
    });

    return {
      identityRegistryStorageImplementation: storageImpl,
      identityRegistryStorageProxy: storageProxy,
      identityRegistryStorage: identityRegistryStorage,
    };
  }
);

export default IdentityRegistryStorageModule;
