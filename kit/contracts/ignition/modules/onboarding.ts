import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKOnboardingPushAirdropFactoryModule from "./onboarding/addons/airdrop/push-airdrop-factory";
import ATKOnboardingTimeboundAirdropFactoryModule from "./onboarding/addons/airdrop/timebound-airdrop-factory";
import ATKOnboardingVestingAirdropFactoryModule from "./onboarding/addons/airdrop/vesting-airdrop-factory";
import ATKOnboardingFixedYieldScheduleFactoryModule from "./onboarding/addons/fixed-yield-schedule-factory";
import ATKOnboardingXvPSettlementFactoryModule from "./onboarding/addons/xvp-settlement-factory";
import ATKOnboardingBondModule from "./onboarding/assets/bond";
import ATKOnboardingDepositModule from "./onboarding/assets/deposit";
import ATKOnboardingEquityModule from "./onboarding/assets/equity";
import ATKOnboardingFundModule from "./onboarding/assets/fund";
import ATKOnboardingStableCoinModule from "./onboarding/assets/stablecoin";
import AddressBlockListModule from "./onboarding/modules/address-block-list-module";
import CountryAllowListModule from "./onboarding/modules/country-allow-list-module";
import CountryBlockListModule from "./onboarding/modules/country-block-list-module";
import IdentityAllowListModule from "./onboarding/modules/identity-allow-list-module";
import IdentityBlockListModule from "./onboarding/modules/identity-block-list-module";
import IdentityVerificationModule from "./onboarding/modules/identity-verification-module";
import InvestorCountModule from "./onboarding/modules/investor-count-module";
import TimeLockModule from "./onboarding/modules/time-lock-module";
import TokenSupplyLimitModule from "./onboarding/modules/token-supply-limit-module";
import ATKOnboardingSystemModule from "./onboarding/system";

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
    tokenFactoryRegistry,
    complianceModuleRegistry,
    systemAddonRegistry,
    systemAccessManager,
  } = m.useModule(ATKOnboardingSystemModule);

  // Setup factories
  const { bondFactory } = m.useModule(ATKOnboardingBondModule);
  const { depositFactory } = m.useModule(ATKOnboardingDepositModule);
  const { equityFactory } = m.useModule(ATKOnboardingEquityModule);
  const { fundFactory } = m.useModule(ATKOnboardingFundModule);
  const { stablecoinFactory } = m.useModule(ATKOnboardingStableCoinModule);

  // Setup addons
  const { fixedYieldScheduleFactory } = m.useModule(
    ATKOnboardingFixedYieldScheduleFactoryModule
  );

  const { xvpSettlementFactory } = m.useModule(
    ATKOnboardingXvPSettlementFactoryModule
  );

  const { vestingAirdropFactory } = m.useModule(
    ATKOnboardingVestingAirdropFactoryModule
  );

  const { pushAirdropFactory } = m.useModule(
    ATKOnboardingPushAirdropFactoryModule
  );

  const { timeBoundAirdropFactory } = m.useModule(
    ATKOnboardingTimeboundAirdropFactoryModule
  );

  // Setup compliance modules
  const { countryAllowListModule } = m.useModule(CountryAllowListModule);
  const { countryBlockListModule } = m.useModule(CountryBlockListModule);
  const { addressBlockListModule } = m.useModule(AddressBlockListModule);
  const { identityBlockListModule } = m.useModule(IdentityBlockListModule);
  const { identityAllowListModule } = m.useModule(IdentityAllowListModule);
  const { identityVerificationModule } = m.useModule(
    IdentityVerificationModule
  );
  const { tokenSupplyLimitModule } = m.useModule(TokenSupplyLimitModule);
  const { investorCountModule } = m.useModule(InvestorCountModule);
  const { timeLockModule } = m.useModule(TimeLockModule);

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
    systemAccessManager,
    // Registries
    tokenFactoryRegistry,
    complianceModuleRegistry,
    systemAddonRegistry,
    // Compliance modules
    countryAllowListModule,
    countryBlockListModule,
    addressBlockListModule,
    identityBlockListModule,
    identityAllowListModule,
    identityVerificationModule,
    tokenSupplyLimitModule,
    investorCountModule,
    timeLockModule,
    // Addons
    fixedYieldScheduleFactory,
    xvpSettlementFactory,
    vestingAirdropFactory,
    pushAirdropFactory,
    timeBoundAirdropFactory,
  };
});

export default ATKOnboardingModule;
