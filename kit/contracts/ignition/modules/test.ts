import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import AssetTokenizationOnboardingModule from "./onboarding";
import DepositModule from "./tokens/deposit";
const AssetTokenizationTestModule = buildModule(
  "AssetTokenizationTestModule",
  (m) => {
    m.useModule(AssetTokenizationOnboardingModule);

    const { eurd } = m.useModule(DepositModule);

    return { eurd };
  }
);

export default AssetTokenizationTestModule;
