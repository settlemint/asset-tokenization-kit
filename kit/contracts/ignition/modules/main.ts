import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import VestingAirdropFactoryModule from "./predeployed/addons/airdrop/vesting-airdrop-factory";
import FixedYieldScheduleFactoryModule from "./predeployed/addons/fixed-yield-schedule-factory";
import BondModule from "./predeployed/assets/bond";
import DepositModule from "./predeployed/assets/deposit";
import EquityModule from "./predeployed/assets/equity";
import FundModule from "./predeployed/assets/fund";
import StableCoinModule from "./predeployed/assets/stablecoin";
import AddressBlockListModule from "./predeployed/modules/address-block-list-module";
import CountryAllowListModule from "./predeployed/modules/country-allow-list-module";
import CountryBlockListModule from "./predeployed/modules/country-block-list-module";
import IdentityAllowListModule from "./predeployed/modules/identity-allow-list-module";
import IdentityBlockListModule from "./predeployed/modules/identity-block-list-module";
import SystemFactoryModule from "./predeployed/system-factory";

/**
 * This module is used to deploy the ATK contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled
 * by predeploying in the genesis file.
 */
const ATKModule = buildModule("ATKModule", (m) => {
  const { systemFactory } = m.useModule(SystemFactoryModule);
  const { bondImplementation, bondFactoryImplementation } =
    m.useModule(BondModule);
  const { depositImplementation, depositFactoryImplementation } =
    m.useModule(DepositModule);
  const { equityImplementation, equityFactoryImplementation } =
    m.useModule(EquityModule);
  const { fundImplementation, fundFactoryImplementation } =
    m.useModule(FundModule);
  const { stablecoinImplementation, stablecoinFactoryImplementation } =
    m.useModule(StableCoinModule);
  const { fixedYieldScheduleFactoryImplementation } = m.useModule(
    FixedYieldScheduleFactoryModule
  );
  const { vestingAirdropFactoryImplementation } = m.useModule(
    VestingAirdropFactoryModule
  );

  const { countryAllowListModule } = m.useModule(CountryAllowListModule);
  const { countryBlockListModule } = m.useModule(CountryBlockListModule);
  const { addressBlockListModule } = m.useModule(AddressBlockListModule);
  const { identityBlockListModule } = m.useModule(IdentityBlockListModule);
  const { identityAllowListModule } = m.useModule(IdentityAllowListModule);

  return {
    systemFactory,
    bondImplementation,
    bondFactoryImplementation,
    depositImplementation,
    depositFactoryImplementation,
    equityImplementation,
    equityFactoryImplementation,
    fundImplementation,
    fundFactoryImplementation,
    stablecoinImplementation,
    stablecoinFactoryImplementation,
    fixedYieldScheduleFactoryImplementation,
    vestingAirdropFactoryImplementation,
    // compliancemodules
    countryAllowListModule,
    countryBlockListModule,
    addressBlockListModule,
    identityBlockListModule,
    identityAllowListModule,
  };
});

export default ATKModule;
