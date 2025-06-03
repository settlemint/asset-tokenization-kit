import {
  countryAllowListAbi,
  countryBlockListAbi,
  ismartCustodianAbi,
} from "../abi";
import { accessManagerAbi } from "../abi/accessManager";
import { bondAbi } from "../abi/bond";
import { bondFactoryAbi } from "../abi/bondFactory";
import { complianceAbi } from "../abi/compliance";
import { depositAbi } from "../abi/deposit";
import { depositFactoryAbi } from "../abi/depositFactory";
import { equityAbi } from "../abi/equity";
import { equityFactoryAbi } from "../abi/equityFactory";
import { fundAbi } from "../abi/fund";
import { fundFactoryAbi } from "../abi/fundFactory";
import { identityAbi } from "../abi/identity";
import { identityFactoryAbi } from "../abi/identityFactory";
import { identityRegistryAbi } from "../abi/identityRegistry";
import { identityRegistryStorageAbi } from "../abi/identityRegistryStorage";
import { ismartAbi } from "../abi/ismart";
import { ismartBurnableAbi } from "../abi/ismartBurnable";
import { ismartPausableAbi } from "../abi/ismartPausable";
import { stablecoinAbi } from "../abi/stablecoin";
import { stablecoinFactoryAbi } from "../abi/stablecoinFactory";
import { systemAbi } from "../abi/system";
import { tokenIdentityAbi } from "../abi/tokenIdentity";
import { topicSchemeRegistryAbi } from "../abi/topicSchemeRegistry";
import { trustedIssuersRegistryAbi } from "../abi/trustedIssuersRegistry";

export const SMARTContracts = {
  // onboarding
  system: systemAbi,
  compliance: complianceAbi,
  identityRegistry: identityRegistryAbi,
  identityRegistryStorage: identityRegistryStorageAbi,
  trustedIssuersRegistry: trustedIssuersRegistryAbi,
  topicSchemeRegistry: topicSchemeRegistryAbi,
  identityFactory: identityFactoryAbi,
  bondFactory: bondFactoryAbi,
  depositFactory: depositFactoryAbi,
  equityFactory: equityFactoryAbi,
  fundFactory: fundFactoryAbi,
  stablecoinFactory: stablecoinFactoryAbi,
  // token
  accessManager: accessManagerAbi,
  identity: identityAbi,
  tokenIdentity: tokenIdentityAbi,
  // tokens
  deposit: depositAbi,
  equity: equityAbi,
  fund: fundAbi,
  stablecoin: stablecoinAbi,
  bond: bondAbi,
  // smart
  ismart: ismartAbi,
  ismartBurnable: ismartBurnableAbi,
  ismartCustodian: ismartCustodianAbi,
  ismartPausable: ismartPausableAbi,
  // compliance modules
  countryAllowListModule: countryAllowListAbi,
  countryBlockListModule: countryBlockListAbi,
} as const;
