import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKOnboardingVestingAirdropFactoryModule from "./onboarding/addons/airdrop/vesting-airdrop-factory";
import ATKOnboardingFixedYieldScheduleFactoryModule from "./onboarding/addons/fixed-yield-schedule-factory";
import ATKOnboardingXvPSettlementFactoryModule from "./onboarding/addons/xvp-settlement-factory";
import ATKOnboardingBondModule from "./onboarding/assets/bond";
import ATKOnboardingDepositModule from "./onboarding/assets/deposit";
import ATKOnboardingEquityModule from "./onboarding/assets/equity";
import ATKOnboardingFundModule from "./onboarding/assets/fund";
import ATKOnboardingStableCoinModule from "./onboarding/assets/stablecoin";
import ATKOnboardingSystemModule from "./onboarding/system";
import AddressBlockListModule from "./predeployed/modules/address-block-list-module";
import CountryAllowListModule from "./predeployed/modules/country-allow-list-module";
import CountryBlockListModule from "./predeployed/modules/country-block-list-module";
import IdentityAllowListModule from "./predeployed/modules/identity-allow-list-module";
import IdentityBlockListModule from "./predeployed/modules/identity-block-list-module";

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
  const { addressBlockListModule } = m.useModule(AddressBlockListModule);
  const { identityBlockListModule } = m.useModule(IdentityBlockListModule);
  const { identityAllowListModule } = m.useModule(IdentityAllowListModule);

  const { fixedYieldScheduleFactory } = m.useModule(
    ATKOnboardingFixedYieldScheduleFactoryModule
  );

  const { xvpSettlementFactory } = m.useModule(
    ATKOnboardingXvPSettlementFactoryModule
  );

  const { vestingAirdropFactory } = m.useModule(
    ATKOnboardingVestingAirdropFactoryModule
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
    // Compliance modules
    countryAllowListModule,
    countryBlockListModule,
    addressBlockListModule,
    identityBlockListModule,
    identityAllowListModule,
    // Addons
    fixedYieldScheduleFactory,
    xvpSettlementFactory,
    vestingAirdropFactory,
  };
});

export default ATKOnboardingModule;
