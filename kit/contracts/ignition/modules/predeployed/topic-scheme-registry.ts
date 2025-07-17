import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";
import SystemModule from "./system";

const TopicSchemeRegistryModule = buildModule(
  "TopicSchemeRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);
    const { system } = m.useModule(SystemModule);

    const topicSchemeRegistry = m.contract(
      "ATKTopicSchemeRegistryImplementation",
      [forwarder]
    );

    // We'll use the system contract to get the access manager address during bootstrap
    // The initialize call will happen separately in the system bootstrap process

    return { topicSchemeRegistry };
  }
);

export default TopicSchemeRegistryModule;
