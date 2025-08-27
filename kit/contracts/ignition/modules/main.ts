import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import PushAirdropFactoryModule from "./predeployed/addons/airdrop/push-airdrop-factory";
import TimeboundAirdropFactoryModule from "./predeployed/addons/airdrop/time-bound-airdrop.factory";
import VestingAirdropFactoryModule from "./predeployed/addons/airdrop/vesting-airdrop-factory";
import FixedYieldScheduleFactoryModule from "./predeployed/addons/fixed-yield-schedule-factory";
import VaultFactoryModule from "./predeployed/addons/vault/vault-factory";
import XvPSettlementFactoryModule from "./predeployed/addons/xvp-settlement-factory";
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
import IdentityVerificationModule from "./predeployed/modules/identity-verification-module";
import InvestorCountModule from "./predeployed/modules/investor-count-module";
import TimeLockModule from "./predeployed/modules/time-lock-module";
import TokenSupplyLimitModule from "./predeployed/modules/token-supply-limit-module";
import TransferApprovalModule from "./predeployed/modules/transfer-approval-module";
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
  const { xvpSettlementImplementation, xvpSettlementFactoryImplementation } =
    m.useModule(XvPSettlementFactoryModule);
  const { vestingAirdropFactoryImplementation } = m.useModule(
    VestingAirdropFactoryModule
  );
  const { pushAirdropFactoryImplementation } = m.useModule(
    PushAirdropFactoryModule
  );
  const { timeBoundAirdropFactoryImplementation } = m.useModule(
    TimeboundAirdropFactoryModule
  );
  const { vaultFactoryImplementation } = m.useModule(VaultFactoryModule);

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
  const { transferApprovalModule } = m.useModule(TransferApprovalModule);

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
    xvpSettlementImplementation,
    xvpSettlementFactoryImplementation,
    vestingAirdropFactoryImplementation,
    pushAirdropFactoryImplementation,
    timeBoundAirdropFactoryImplementation,
    vaultFactoryImplementation,
    // compliancemodules
    countryAllowListModule,
    countryBlockListModule,
    addressBlockListModule,
    identityBlockListModule,
    identityAllowListModule,
    identityVerificationModule,
    tokenSupplyLimitModule,
    investorCountModule,
    timeLockModule,
    transferApprovalModule,
  };
});

export default ATKModule;
