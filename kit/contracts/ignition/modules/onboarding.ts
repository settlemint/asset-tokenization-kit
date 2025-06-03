import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTOnboardingBondModule from "./onboarding/assets/bond";
import SMARTOnboardingDepositModule from "./onboarding/assets/deposit";
import SMARTOnboardingEquityModule from "./onboarding/assets/equity";
import SMARTOnboardingFundModule from "./onboarding/assets/fund";
import SMARTOnboardingStableCoinModule from "./onboarding/assets/stablecoin";
import SMARTOnboardingSystemModule from "./onboarding/system";
import CountryAllowListModule from "./predeployed/modules/country-allow-list-module";
import CountryBlockListModule from "./predeployed/modules/country-block-list-module";

/**
 * This module is used to deploy the SMART contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled
 * by predeploying in the genesis file.
 */
const SMARTOnboardingModule = buildModule("SMARTOnboardingModule", (m) => {
  const {
    system,
    compliance,
    identityRegistry,
    identityRegistryStorage,
    trustedIssuersRegistry,
    topicSchemeRegistry,
    identityFactory,
  } = m.useModule(SMARTOnboardingSystemModule);

  // This can be setup based out of configuration in the onboarding wizard at some point
  const { bondFactory } = m.useModule(SMARTOnboardingBondModule);
  const { depositFactory } = m.useModule(SMARTOnboardingDepositModule);
  const { equityFactory } = m.useModule(SMARTOnboardingEquityModule);
  const { fundFactory } = m.useModule(SMARTOnboardingFundModule);
  const { stablecoinFactory } = m.useModule(SMARTOnboardingStableCoinModule);

  const { countryAllowListModule } = m.useModule(CountryAllowListModule);
  const { countryBlockListModule } = m.useModule(CountryBlockListModule);

  return {
    system,
    compliance,
    identityRegistry,
    identityRegistryStorage,
    trustedIssuersRegistry,
    topicSchemeRegistry,
    identityFactory,
    bondFactory,
    depositFactory,
    equityFactory,
    fundFactory,
    stablecoinFactory,
    // Compliance modules
    countryAllowListModule,
    countryBlockListModule,
  };
});

export default SMARTOnboardingModule;
