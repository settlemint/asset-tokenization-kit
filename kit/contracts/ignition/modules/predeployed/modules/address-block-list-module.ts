import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const AddressBlockListModule = buildModule('AddressBlockListModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const addressBlockListModule = m.contract(
    'AddressBlockListComplianceModule',
    [forwarder]
  );

  return { addressBlockListModule };
});

export default AddressBlockListModule;
