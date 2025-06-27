import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../../forwarder';

const VestingAirdropFactoryModule = buildModule(
  'VestingAirdropFactoryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const vestingAirdropFactoryImplementation = m.contract(
      'ATKVestingAirdropFactoryImplementation',
      [forwarder]
    );

    return { vestingAirdropFactoryImplementation };
  }
);

export default VestingAirdropFactoryModule;
