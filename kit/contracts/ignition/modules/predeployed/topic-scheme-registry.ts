import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from './forwarder';

const TopicSchemeRegistryModule = buildModule(
  'TopicSchemeRegistryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const topicSchemeRegistry = m.contract(
      'ATKTopicSchemeRegistryImplementation',
      [forwarder]
    );

    return { topicSchemeRegistry };
  }
);

export default TopicSchemeRegistryModule;
