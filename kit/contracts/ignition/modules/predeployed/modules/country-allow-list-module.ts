import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const CountryAllowListModule = buildModule('CountryAllowListModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const countryAllowListModule = m.contract(
    'CountryAllowListComplianceModule',
    [forwarder]
  );

  return { countryAllowListModule };
});

export default CountryAllowListModule;
