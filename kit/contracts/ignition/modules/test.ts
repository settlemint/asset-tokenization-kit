import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import AssetTokenizationModule from "./main";

const AssetTokenizationTestModule = buildModule(
  "AssetTokenizationTestModule",
  (m) => {
    const { forwarder } = m.useModule(AssetTokenizationModule);

    return {
      forwarder,
    };
  }
);

export default AssetTokenizationTestModule;
