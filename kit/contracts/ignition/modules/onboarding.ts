import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKOnboardingFixedYieldScheduleFactoryModule from "./onboarding/addons/fixed-yield-schedule-factory";
import ATKOnboardingBondModule from "./onboarding/assets/bond";
import ATKOnboardingDepositModule from "./onboarding/assets/deposit";
import ATKOnboardingEquityModule from "./onboarding/assets/equity";
import ATKOnboardingFundModule from "./onboarding/assets/fund";
import ATKOnboardingStableCoinModule from "./onboarding/assets/stablecoin";
import ATKOnboardingSystemModule from "./onboarding/system";
import CountryAllowListModule from "./predeployed/modules/country-allow-list-module";
import CountryBlockListModule from "./predeployed/modules/country-block-list-module";

/**
 * This module is used to deploy the ATK contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled
 * by predeploying in the genesis file.
 */
const ATKOnboardingModule = buildModule("ATKOnboardingModule", (m) => {
  const {
    system,
    compliance,
    identityRegistry,
    identityRegistryStorage,
    trustedIssuersRegistry,
    topicSchemeRegistry,
    identityFactory,
  } = m.useModule(ATKOnboardingSystemModule);

  // This can be setup based out of configuration in the onboarding wizard at some point
  const { bondFactory } = m.useModule(ATKOnboardingBondModule);
  const { depositFactory } = m.useModule(ATKOnboardingDepositModule);
  const { equityFactory } = m.useModule(ATKOnboardingEquityModule);
  const { fundFactory } = m.useModule(ATKOnboardingFundModule);
  const { stablecoinFactory } = m.useModule(ATKOnboardingStableCoinModule);

  const { countryAllowListModule } = m.useModule(CountryAllowListModule);
  const { countryBlockListModule } = m.useModule(CountryBlockListModule);

  const { fixedYieldScheduleFactory } = m.useModule(
    ATKOnboardingFixedYieldScheduleFactoryModule
  );

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
    fixedYieldScheduleFactory,
    // Compliance modules
    countryAllowListModule,
    countryBlockListModule,
  };
});

export default ATKOnboardingModule;
