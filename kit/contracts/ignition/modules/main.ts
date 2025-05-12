import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeploymentRegistryModule from "./implementations/deployment-registry";
import ForwarderModule from "./implementations/forwarder";

/**
 * This module is used to deploy the asset tokenization contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled by predeploying
 * in the genesis file.
 */
const AssetTokenizationModule = buildModule("AssetTokenizationModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { deploymentRegistry } = m.useModule(DeploymentRegistryModule);

  return {
    forwarder,
    deploymentRegistry,
  };
});

export default AssetTokenizationModule;
