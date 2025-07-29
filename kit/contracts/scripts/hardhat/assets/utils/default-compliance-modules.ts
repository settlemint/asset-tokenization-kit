import { ATKTopic } from "../../constants/topics";
import { atkDeployer } from "../../services/deployer";
import { expressionBuilder } from "../../utils/expression-builder";
import { encodeAddressParams } from "./encode-address-params";
import { encodeCountryParams } from "./encode-country-params";

export const getDefaultComplianceModules = () => {
  return [
    {
      module: atkDeployer.getContractAddress("identityVerificationModule"),
      params: expressionBuilder().topic(ATKTopic.kyc).encode(),
    },
    {
      module: atkDeployer.getContractAddress("addressBlockListModule"),
      params: encodeAddressParams([]),
    },
    {
      module: atkDeployer.getContractAddress("identityBlockListModule"),
      params: encodeAddressParams([]),
    },
    {
      module: atkDeployer.getContractAddress("countryBlockListModule"),
      params: encodeCountryParams([]),
    },
  ];
};
