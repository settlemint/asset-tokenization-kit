import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../../forwarder';

const TimeBoundAirdropFactoryModule = buildModule(
  'TimeBoundAirdropFactoryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const timeBoundAirdropFactoryImplementation = m.contract(
      'ATKTimeBoundAirdropFactoryImplementation',
      [forwarder]
    );

    return { timeBoundAirdropFactoryImplementation };
  }
);

export default TimeBoundAirdropFactoryModule;
