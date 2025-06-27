import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const IdentityRegistryStorageModule = buildModule(
  'IdentityRegistryStorageModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const identityRegistryStorage = m.contract(
      'ATKIdentityRegistryStorageImplementation',
      [forwarder]
    );

    return { identityRegistryStorage };
  }
);

export default IdentityRegistryStorageModule;
