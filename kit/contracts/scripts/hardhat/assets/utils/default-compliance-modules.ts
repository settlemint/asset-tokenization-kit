import { atkDeployer } from '../../services/deployer';
import { encodeAddressParams } from './encode-address-params';
import { encodeCountryParams } from './encode-country-params';

export const getDefaultComplianceModules = () => {
  return [
    {
      module: atkDeployer.getContractAddress('addressBlockListModule'),
      params: encodeAddressParams([]),
    },
    {
      module: atkDeployer.getContractAddress('identityBlockListModule'),
      params: encodeAddressParams([]),
    },
    {
      module: atkDeployer.getContractAddress('countryBlockListModule'),
      params: encodeCountryParams([]),
    },
  ];
};
