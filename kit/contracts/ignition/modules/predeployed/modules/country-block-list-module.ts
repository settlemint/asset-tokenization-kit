import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const CountryBlockListModule = buildModule('CountryBlockListModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const countryBlockListModule = m.contract(
    'CountryBlockListComplianceModule',
    [forwarder]
  );

  return { countryBlockListModule };
});

export default CountryBlockListModule;
