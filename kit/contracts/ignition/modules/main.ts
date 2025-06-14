import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import FixedYieldScheduleFactoryModule from "./predeployed/addons/fixed-yield-schedule-factory";
import BondModule from "./predeployed/assets/bond";
import DepositModule from "./predeployed/assets/deposit";
import EquityModule from "./predeployed/assets/equity";
import FundModule from "./predeployed/assets/fund";
import StableCoinModule from "./predeployed/assets/stablecoin";
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
  };
});

export default ATKModule;
